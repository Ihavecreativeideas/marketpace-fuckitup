# VERCEL 404 FIX - REPLACE EXISTING INDEX.HTML

## PROBLEM:
You have an existing index.html but it's not working properly for Vercel deployment.

## SOLUTION:
Replace the content of your existing index.html file with this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MarketPace - Local Community Marketplace</title>
    <meta http-equiv="refresh" content="0; url=/pitch-page.html">
    <script>
        window.location.replace('/pitch-page.html');
    </script>
</head>
<body>
    <p>Loading MarketPace...</p>
    <p><a href="/pitch-page.html">Click here if you are not redirected automatically</a></p>
</body>
</html>
```

## ALSO UPDATE vercel.json:
Replace your vercel.json content with this minimal config:

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

## STEPS:
1. Edit existing index.html in GitHub with new content above
2. Edit existing vercel.json with minimal config above
3. Commit changes
4. Wait 2-3 minutes for redeploy
5. Test www.marketpace.shop

This will make your root domain automatically redirect to pitch-page.html and fix the 404 error.