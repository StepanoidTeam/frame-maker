# Frame Maker

## Setup

### Environment Configuration

1. Copy `env.example.js` to `env.js`:
   ```bash
   cp env.example.js env.js
   ```

2. Fill in your Firebase credentials in `env.js`

3. **Never commit `env.js` to the repository!** It's already in `.gitignore`

### For GitHub Actions / Deployment

To make builds work on GitHub, you need to use GitHub Secrets:

1. Go to your repository settings → Secrets and variables → Actions
2. Add the following secrets:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID`

3. In your GitHub Actions workflow, create `env.js` from secrets:
   ```yaml
   - name: Create env.js
     run: |
       echo "export const ENV = {" > env.js
       echo "  FIREBASE_API_KEY: '${{ secrets.FIREBASE_API_KEY }}'," >> env.js
       echo "  FIREBASE_AUTH_DOMAIN: '${{ secrets.FIREBASE_AUTH_DOMAIN }}'," >> env.js
       echo "  FIREBASE_PROJECT_ID: '${{ secrets.FIREBASE_PROJECT_ID }}'," >> env.js
       echo "  FIREBASE_STORAGE_BUCKET: '${{ secrets.FIREBASE_STORAGE_BUCKET }}'," >> env.js
       echo "  FIREBASE_MESSAGING_SENDER_ID: '${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}'," >> env.js
       echo "  FIREBASE_APP_ID: '${{ secrets.FIREBASE_APP_ID }}'," >> env.js
       echo "  FIREBASE_MEASUREMENT_ID: '${{ secrets.FIREBASE_MEASUREMENT_ID }}'," >> env.js
       echo "};" >> env.js
   ```

...goes here

