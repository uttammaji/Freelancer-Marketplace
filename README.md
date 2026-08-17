
# Freelancer-Marketplace

Freelancer_MarketPlace group project

##  Team Members & Roles

| Name | Role | Branch Name |
|------|------|-------------|
| Sanjib | Backend | `sanjib` |
| Uttam | Backend | `uttam` |
| Subhra | Frontend | `subhra` |
| Ayush | Frontend | `ayush` |

##  Project Setup

```bash
# Clone the repository
git clone <repository-url>

# Go to project folder
cd Freelancer-Marketplace

# Install dependencies
npm install

# Run project
npm run dev
```

##  Git Rules (IMPORTANT!)

1. **Only use Git Terminal** - No GUI tools
2. **Everyone works on their own branch only**
3. **Never push to main branch directly**
4. **Always fetch before push**

##  First Time Setup (Do this once)

```bash
# Clone the repo
git clone <repository-url>
cd Freelancer-Marketplace

# Create YOUR branch (use your name)
git checkout -b sanjib    # Sanjib
git checkout -b uttam     # Uttam
git checkout -b subhra    # Subhra
git checkout -b ayush     # Ayush

# Push your branch to GitHub
git push origin sanjib    # Example for Sanjib
```

##  Daily Workflow

### When you start working:

```bash
# 1. Go to your branch
git checkout sanjib    # (use your branch name)

# 2. Get latest from main
git fetch origin
git merge origin/main

# 3. Start coding...
```

### After completing a feature:

```bash
# 1. Check what files you changed
git status

# 2. Add your files
git add .

# 3. Commit your changes
git commit -m "added login API"

# 4. Fetch latest from main
git fetch origin

# 5. Merge main into your branch (if needed)
git merge origin/main

# 6. Push to YOUR branch
git push origin sanjib    # (use your branch name)
```

##  Merging to Main (Only after feature is complete)

```bash
# 1. First push everything to your branch
git push origin sanjib    # (your branch)

# 2. Switch to main
git checkout main

# 3. Get latest main
git pull origin main

# 4. Merge your branch into main
git merge sanjib    # (your branch)

# 5. Push main
git push origin main

# 6. Go back to your branch
git checkout sanjib    # (your branch)
```

## Common Commands You'll Need

```bash
# Check which branch you are on
git branch

# Switch to your branch
git checkout sanjib    # (your branch name)

# See all branches
git branch -a

# Check what you changed
git status

# See the changes in files
git diff

# Undo changes in a file
git checkout -- filename

# See commit history
git log --oneline
```

##  If You Get Conflicts

```bash
# When merge conflict happens:
# 1. Open the file with conflict
# 2. Look for these markers:
<<<<<<< HEAD
your code
=======
their code
>>>>>>> branch-name

# 3. Keep the correct code, delete wrong code and markers
# 4. Save the file
# 5. Then:
git add .
git commit -m "fixed conflict"
git push origin sanjib    # (your branch)
```

##  What NOT to Do

```bash
# DON'T push to main directly
git push origin main    

# DON'T work on main branch
git checkout main
git add .
git commit -m "some changes"    

# DON'T use GitHub Desktop or any GUI    

# DON'T push without fetching first
git push origin sanjib     (without fetch first)
```

##  Quick Checklist Before Push

- [ ] I am on MY branch (`git branch` to check)
- [ ] I fetched latest from main (`git fetch origin`)
- [ ] I merged main into my branch (`git merge origin/main`)
- [ ] My code works
- [ ] I committed with a clear message

##  Need Help?

- Ask any team member
- Don't push if you're not sure
- Always ask before merging to main

---

###  SIMPLE RULE:
**Your branch = Your name. Push only to your branch. Fetch before push. No GUI.**
