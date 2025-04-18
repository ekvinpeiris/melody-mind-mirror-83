
#!/bin/bash

# Initialize git repository
git init

# Add all files
git add .

# Create an initial commit
git commit -m "Initial commit of MidiPlayer project"

# Add the remote repository
git remote add origin https://github.com/ekvinpeiris/MidiPlayer.git

# Push the code to GitHub
git push -u origin main
