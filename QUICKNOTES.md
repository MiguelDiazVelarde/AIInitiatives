# Quick Notes
## _For Exeuction_

npm start        # Run in production

http://localhost:3000
Credentials: admin / password

## _For Testin_

npm run test              # Run all tests
npm run test:full         # Run tests with HTML report
npm run test:auth         # Authentication tests only
npm run test:products     # Product tests only
npm run test:navigation   # Navigation tests only
npm run test:smoke        # Quick smoke tests
npm run test:headed       # Run tests in visible browser

## _For create a new pull request for changes_
Create branch:
git branch '<branch name>'
e.g.
git branch 'rv/ta-added-missing-tag2'

Go to branch:
git checkout '<branch name>' 
e.g.
git checkout 'rv/ta-added-missing-tag'

Make changes in Visual Code:
modified:   automation/features/application/reporting/MultipleReports.feature
modified:   automation/src/applicationlayer/notification/notification.ts
modified:   automation/src/applicationlayer/pageobject.ts
modified:   automation/src/locators/Dialog.locators.json
modified:   automation/src/steps/procedurelogging/notification.steps.ts

Add to the branch of the local repository only one file:
git add 'file'
e.g.
git add 'automation/features/application/reporting/MultipleReports.feature'

Add to local repository all changed files:
git add .

Push to local repository:
git commit -m "{commit message}"
e.g.
git commit -S -m "Update changes to Feature: Reporting - Multiple reports"

For editing a commit:
git commit --amend -S -m "New commit message"
e.g.
git commit --amend -S -m "Update observations regards to Feature: Reporting - Multiple reports"

Upload to pull request to remote repository corresponding to the branch:
git push origin <branch>
e.g.
git push origin rv/ta-notification-amend2

git - Update a local branch with the changes from a tracked remote branch - Stack Overflow:
git pull origin 'rv/ta-added-missing-tag2'

New text