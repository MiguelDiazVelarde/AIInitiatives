"""
Visual Comparator - Visual Regression Testing Implementation
Based on ISTQB CT-AI 11.6.2

This module implements computer vision algorithms to compare screenshots
and detect unintended visual changes.
"""

import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from PIL import Image
import imagehash


@dataclass
class VisualDifference:
    """Represents a visual difference region"""
    x: int
    y: int
    width: int
    height: int
    area: int
    severity: str  # 'low', 'medium', 'high'
    
    def to_dict(self) -> Dict:
        return {
            'x': self.x,
            'y': self.y,
            'width': self.width,
            'height': self.height,
            'area': self.area,
            'severity': self.severity
        }


class VisualComparator:
    """
    Compare images to detect visual differences using Computer Vision.
    
    Implements concepts from ISTQB CT-AI 11.6.2:
    - Uses computer vision algorithms for image comparison
    - Identifies changes to layout, size, position, color, font
    - Supports visual regression testing
    - Can determine if changes are acceptable or require human review
    """
    
    def __init__(
        self,
        threshold: float = 0.95,
        pixel_tolerance: int = 10,
        min_area: int = 100,
        ignore_antialiasing: bool = True
    ):
        """
        Initialize Visual Comparator
        
        Args:
            threshold: Similarity threshold (0-1). Higher = stricter
            pixel_tolerance: Tolerance for pixel value differences
            min_area: Minimum area (px²) to consider as difference
            ignore_antialiasing: Ignore minor antialiasing differences
        """
        self.threshold = threshold
        self.pixel_tolerance = pixel_tolerance
        self.min_area = min_area
        self.ignore_antialiasing = ignore_antialiasing
    
    def compare_screenshots(
        self,
        baseline_path: str,
        current_path: str,
        diff_output_path: Optional[str] = None
    ) -> Dict:
        """
        Compare two screenshots and detect differences.
        
        Returns comprehensive comparison results including:
        - Similarity score (0-1)
        - Whether changes are acceptable
        - Detected difference regions
        - Visual metrics (MSE, SSIM, histogram correlation)
        
        Args:
            baseline_path: Path to baseline/reference image
            current_path: Path to current/test image
            diff_output_path: Optional path to save diff visualization
            
        Returns:
            Dict with comparison results
            
        Example:
            >>> comparator = VisualComparator(threshold=0.95)
            >>> result = comparator.compare_screenshots(
            ...     "baseline/home.png",
            ...     "current/home.png",
            ...     "diff/home_diff.png"
            ... )
            >>> print(f"Similarity: {result['similarity_score']:.2%}")
            >>> if not result['is_acceptable']:
            ...     print(f"Found {result['differences_detected']} issues")
        """
        # Load images
        baseline = cv2.imread(str(baseline_path))
        current = cv2.imread(str(current_path))
        
        if baseline is None:
            raise ValueError(f"Could not load baseline image: {baseline_path}")
        if current is None:
            raise ValueError(f"Could not load current image: {current_path}")
        
        # Resize current to match baseline if needed
        if baseline.shape != current.shape:
            print(f"⚠️  Resizing current image from {current.shape} to {baseline.shape}")
            current = cv2.resize(current, (baseline.shape[1], baseline.shape[0]))
        
        # Calculate multiple similarity metrics
        ssim_score = self._calculate_ssim(baseline, current)
        mse_score = self._calculate_mse(baseline, current)
        hist_correlation = self._calculate_histogram_correlation(baseline, current)
        perceptual_hash_diff = self._calculate_perceptual_hash_diff(baseline_path, current_path)
        
        # Calculate overall similarity (weighted average)
        similarity_score = (
            ssim_score * 0.5 +
            (1.0 - min(mse_score / 10000.0, 1.0)) * 0.2 +
            hist_correlation * 0.2 +
            (1.0 - min(perceptual_hash_diff / 64.0, 1.0)) * 0.1
        )
        
        # Detect difference regions
        diff_regions = self._detect_differences(baseline, current)
        
        # Classify differences by severity
        classified_regions = self._classify_differences(diff_regions, baseline.shape)
        
        # Determine if changes are acceptable
        is_acceptable = (
            similarity_score >= self.threshold and
            len([r for r in classified_regions if r.severity == 'high']) == 0
        )
        
        # Generate diff visualization if requested
        if diff_output_path:
            self._save_diff_visualization(
                baseline,
                current,
                classified_regions,
                diff_output_path
            )
        
        return {
            'similarity_score': float(similarity_score),
            'is_acceptable': is_acceptable,
            'threshold': self.threshold,
            'differences_detected': len(classified_regions),
            'diff_regions': [r.to_dict() for r in classified_regions],
            'metrics': {
                'ssim': float(ssim_score),
                'mse': float(mse_score),
                'histogram_correlation': float(hist_correlation),
                'perceptual_hash_diff': int(perceptual_hash_diff)
            },
            'severity_breakdown': {
                'high': len([r for r in classified_regions if r.severity == 'high']),
                'medium': len([r for r in classified_regions if r.severity == 'medium']),
                'low': len([r for r in classified_regions if r.severity == 'low'])
            },
            'recommendation': self._get_recommendation(similarity_score, classified_regions)
        }
    
    def _calculate_ssim(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """
        Calculate Structural Similarity Index (SSIM)
        SSIM considers luminance, contrast, and structure
        """
        try:
            from skimage.metrics import structural_similarity
            
            gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
            gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
            
            score, _ = structural_similarity(gray1, gray2, full=True)
            return score
        except ImportError:
            # Fallback to simple correlation if scikit-image not available
            gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
            gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
            
            correlation = np.corrcoef(gray1.flatten(), gray2.flatten())[0, 1]
            return max(0.0, correlation)
    
    def _calculate_mse(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Calculate Mean Squared Error (lower is better)"""
        err = np.sum((img1.astype("float") - img2.astype("float")) ** 2)
        err /= float(img1.shape[0] * img1.shape[1])
        return err
    
    def _calculate_histogram_correlation(
        self,
        img1: np.ndarray,
        img2: np.ndarray
    ) -> float:
        """Compare color histograms"""
        hist1 = cv2.calcHist([img1], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
        hist2 = cv2.calcHist([img2], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
        
        hist1 = cv2.normalize(hist1, hist1).flatten()
        hist2 = cv2.normalize(hist2, hist2).flatten()
        
        correlation = cv2.compareHist(
            hist1.reshape(-1, 1),
            hist2.reshape(-1, 1),
            cv2.HISTCMP_CORREL
        )
        
        return max(0.0, correlation)
    
    def _calculate_perceptual_hash_diff(
        self,
        img1_path: str,
        img2_path: str
    ) -> int:
        """
        Calculate perceptual hash difference
        Returns number of bits different (0 = identical)
        """
        hash1 = imagehash.average_hash(Image.open(img1_path))
        hash2 = imagehash.average_hash(Image.open(img2_path))
        return hash1 - hash2
    
    def _detect_differences(
        self,
        img1: np.ndarray,
        img2: np.ndarray
    ) -> List[VisualDifference]:
        """Detect regions with visual differences"""
        # Convert to grayscale
        gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
        gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur if ignoring antialiasing
        if self.ignore_antialiasing:
            gray1 = cv2.GaussianBlur(gray1, (5, 5), 0)
            gray2 = cv2.GaussianBlur(gray2, (5, 5), 0)
        
        # Calculate absolute difference
        diff = cv2.absdiff(gray1, gray2)
        
        # Apply threshold
        _, thresh = cv2.threshold(diff, self.pixel_tolerance, 255, cv2.THRESH_BINARY)
        
        # Morphological operations to remove noise
        kernel = np.ones((3, 3), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
        
        # Find contours
        contours, _ = cv2.findContours(
            thresh,
            cv2.RETR_EXTERNAL,
            cv2.CONTOUR_APPROX_SIMPLE
        )
        
        # Create VisualDifference objects
        differences = []
        for contour in contours:
            area = cv2.contourArea(contour)
            
            if area >= self.min_area:
                x, y, w, h = cv2.boundingRect(contour)
                
                diff_obj = VisualDifference(
                    x=int(x),
                    y=int(y),
                    width=int(w),
                    height=int(h),
                    area=int(area),
                    severity='medium'  # Will be classified later
                )
                differences.append(diff_obj)
        
        return differences
    
    def _classify_differences(
        self,
        differences: List[VisualDifference],
        image_shape: Tuple
    ) -> List[VisualDifference]:
        """
        Classify differences by severity based on:
        - Size relative to screen
        - Location (center = more important)
        - Number of differences
        """
        total_area = image_shape[0] * image_shape[1]
        center_x, center_y = image_shape[1] // 2, image_shape[0] // 2
        
        for diff in differences:
            # Calculate relative area
            relative_area = diff.area / total_area
            
            # Calculate distance from center (normalized)
            diff_center_x = diff.x + diff.width // 2
            diff_center_y = diff.y + diff.height // 2
            distance_from_center = np.sqrt(
                ((diff_center_x - center_x) / center_x) ** 2 +
                ((diff_center_y - center_y) / center_y) ** 2
            )
            
            # Classify severity
            if relative_area > 0.1 or distance_from_center < 0.3:
                diff.severity = 'high'
            elif relative_area > 0.01 or distance_from_center < 0.6:
                diff.severity = 'medium'
            else:
                diff.severity = 'low'
        
        return differences
    
    def _save_diff_visualization(
        self,
        baseline: np.ndarray,
        current: np.ndarray,
        differences: List[VisualDifference],
        output_path: str
    ):
        """Create and save a visual diff image"""
        # Create side-by-side comparison
        height, width = baseline.shape[:2]
        
        # Create canvas for side-by-side + diff
        canvas = np.zeros((height, width * 3, 3), dtype=np.uint8)
        
        # Place images
        canvas[:, :width] = baseline
        canvas[:, width:width*2] = current
        
        # Create diff visualization
        diff_viz = current.copy()
        
        # Draw rectangles around differences
        for diff in differences:
            color = self._get_severity_color(diff.severity)
            cv2.rectangle(
                diff_viz,
                (diff.x, diff.y),
                (diff.x + diff.width, diff.y + diff.height),
                color,
                2
            )
            
            # Add label
            label = f"{diff.severity.upper()}"
            cv2.putText(
                diff_viz,
                label,
                (diff.x, diff.y - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                color,
                2
            )
        
        canvas[:, width*2:] = diff_viz
        
        # Add labels
        cv2.putText(canvas, "BASELINE", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.putText(canvas, "CURRENT", (width + 10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.putText(canvas, "DIFFERENCES", (width * 2 + 10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        # Save
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(output_path), canvas)
    
    def _get_severity_color(self, severity: str) -> Tuple[int, int, int]:
        """Get BGR color for severity level"""
        colors = {
            'high': (0, 0, 255),    # Red
            'medium': (0, 165, 255),  # Orange
            'low': (0, 255, 255)    # Yellow
        }
        return colors.get(severity, (255, 255, 255))
    
    def _get_recommendation(
        self,
        similarity_score: float,
        differences: List[VisualDifference]
    ) -> str:
        """Generate human-readable recommendation"""
        high_severity = len([d for d in differences if d.severity == 'high'])
        medium_severity = len([d for d in differences if d.severity == 'medium'])
        
        if similarity_score >= 0.99:
            return "✅ Images are virtually identical. Safe to proceed."
        elif similarity_score >= self.threshold and high_severity == 0:
            return "✅ Minor differences detected but acceptable. Review recommended."
        elif high_severity > 0:
            return f"❌ {high_severity} critical difference(s) detected. Human review required."
        elif medium_severity > 3:
            return "⚠️  Multiple significant differences detected. Manual inspection needed."
        else:
            return "⚠️  Differences below threshold. Review changes before proceeding."
