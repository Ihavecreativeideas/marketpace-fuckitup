# How to Access Terminal and Run Git Commands

## Method 1: Replit Shell Tab
1. Look for the "Shell" tab in your Replit interface (usually at the bottom)
2. Click on it to open the terminal
3. Run the commands directly:

```bash
git checkout replit-agent
git add marketpace-logo-1.jpeg marketpace-hero-logo.jpeg assets/founder-brooke-brown.jpg
git commit -m "Add missing image files for logo and founder"
git push origin replit-agent
```

## Method 2: Console Panel
1. In Replit, look for the Console panel (usually bottom-right)
2. Click inside the console area
3. Execute the Git commands one by one

## Method 3: New Terminal Window
1. Press `Ctrl + Shift + S` (or `Cmd + Shift + S` on Mac)
2. This opens a new shell/terminal window
3. Run your Git commands

## Why Git Restrictions Exist
- Security measure to prevent automated Git operations
- Protects against accidental repository changes
- Requires human oversight for Git operations
- Standard practice in cloud development environments

## If Commands Don't Work
Try these troubleshooting steps:

1. **Check current directory:**
   ```bash
   pwd
   ls -la
   ```

2. **Verify Git status:**
   ```bash
   git status
   git branch
   ```

3. **Check Git configuration:**
   ```bash
   git config --list
   ```

4. **Reset if needed:**
   ```bash
   git reset --hard HEAD
   git clean -fd
   ```

## Expected Success Output
After running the commands, you should see:
- "Switched to branch 'replit-agent'"
- Files added confirmation
- Commit created with message
- Push successful to origin/replit-agent

## Next Steps After Success
1. Go to GitHub repository
2. Create pull request: replit-agent → main
3. Review and merge
4. Wait for Vercel deployment

The Git restrictions cannot be bypassed - they're intentional security measures. You must use the terminal directly.