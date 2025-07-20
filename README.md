# Volvo OneView

Strategic Initiative Management Platform for Volvo Group LATAM.

## Features

- **Portfolio Management**: View and manage strategic initiatives
- **Azure DevOps Integration**: Sync data from Azure DevOps work items
- **Executive Dashboard**: Filtered views for directors and executives
- **Data Protection**: Secure sensitive initiative information
- **Direct Links**: Generate filtered portfolio links for specific directors

## Setup

### 1. Azure DevOps Configuration

Copy the configuration example file:
```bash
cp config.js.example config.js
```

Edit `config.js` and replace `your_pat_here` with your actual Azure DevOps Personal Access Token.

**Important**: The `config.js` file is ignored by git to protect your credentials.

### 2. Environment Variables (Alternative)

You can also create a `.env` file:
```bash
cp .env.example .env
```

### 3. Local Development

Open `index.html` in your browser or serve it through a local web server.

## Recent Fixes

### Directors Button Functionality (Latest)
- ✅ Fixed missing `populateDirectorSelect()` function
- ✅ Added copy button functionality for generated links
- ✅ Resolved corrupted JavaScript content
- ✅ Enabled proper director filtering for portfolio links

The Generate Direct Link for Directors button now:
1. Shows section when clicked
2. Populates dropdown with available business owners
3. Generates filtered links with director parameter
4. Enables copying links to clipboard

### Security Improvements
- ✅ Removed hardcoded Azure DevOps PAT from source code
- ✅ Added secure configuration system
- ✅ Updated .gitignore to protect sensitive files

## File Structure

```
/
├── index.html              # Main application interface
├── login.html             # Authentication page
├── migrate.html           # Data migration interface
├── config.js.example      # Configuration template
├── api/                   # Azure Functions backend
├── modules/               # Frontend modules
└── sql/                   # Database schema
```

## Security Notes

- Never commit actual PAT tokens to version control
- Use the provided configuration system for credentials
- Consider implementing a backend proxy for production use
