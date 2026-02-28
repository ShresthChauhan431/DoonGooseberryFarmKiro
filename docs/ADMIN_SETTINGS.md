# Admin Settings Panel

The admin settings panel allows you to manage your website content and appearance through a user-friendly interface without touching code.

## Features

### 1. General Settings
Manage basic site information:
- **Site Name**: Your website's name
- **Site Description**: Brief description for SEO
- **Contact Email**: Customer support email
- **Contact Phone**: Customer support phone number
- **Social Media Links**: Facebook, Instagram, Twitter URLs

### 2. Homepage Settings
Customize your homepage hero section:
- **Hero Background Image**: Upload a custom hero image (recommended: 1920x1080px)
- **Hero Title**: Main headline text
- **Hero Subtitle**: Supporting text below the title
- **Button Text**: Call-to-action button text
- **Button Link**: Where the button should navigate to

### 3. Appearance Settings (Coming Soon)
- Theme colors
- Font selections
- Layout options

### 4. SEO Settings (Coming Soon)
- Meta tags
- Open Graph settings
- Twitter Card settings

## How to Access

1. Log in as an admin user
2. Navigate to `/admin/settings`
3. Use the tabs to switch between different setting categories
4. Make your changes
5. Click "Save Changes"

## Database Structure

Settings are stored in the `site_settings` table with the following structure:

```sql
CREATE TABLE site_settings (
  id UUID PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'text',
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Adding New Settings

To add a new setting:

1. **Add to the database**:
   ```sql
   INSERT INTO site_settings (key, value, type, category)
   VALUES ('your_setting_key', 'default_value', 'text', 'general');
   ```

2. **Add to the query function** (`lib/queries/settings.ts`):
   ```typescript
   export async function getYourSettings() {
     const settings = await getSettingsByCategory('your_category');
     return {
       yourSetting: settings.find(s => s.key === 'your_setting_key')?.value || 'default',
     };
   }
   ```

3. **Add to the form component**:
   ```tsx
   <div className="space-y-2">
     <Label htmlFor="your_setting_key">Your Setting Label</Label>
     <Input
       id="your_setting_key"
       name="your_setting_key"
       defaultValue={getSettingValue('your_setting_key', 'default')}
     />
   </div>
   ```

4. **Update the submit handler** to include your new setting in the `settingsToUpdate` array.

## Image Upload

The settings panel includes image upload functionality for:
- Hero background images
- Logos (coming soon)
- Favicon (coming soon)

Images are uploaded to your configured storage (Cloudflare R2 or Vercel Blob).

## Best Practices

1. **Image Optimization**: Always optimize images before uploading (use tools like TinyPNG or Squoosh)
2. **Recommended Sizes**:
   - Hero Image: 1920x1080px
   - Logo: 512x512px
   - Favicon: 32x32px
3. **Backup**: Keep backups of your settings before making major changes
4. **Testing**: Test changes on a staging environment first

## Troubleshooting

### Settings Not Updating
- Check browser console for errors
- Verify you're logged in as an admin
- Check database connection
- Clear browser cache and refresh

### Images Not Uploading
- Verify storage configuration in `.env`
- Check file size (max 5MB)
- Ensure correct file format (JPG, PNG, WebP)
- Check storage service credentials

### Changes Not Reflecting on Frontend
- Settings are cached for performance
- Wait a few seconds or refresh the page
- Check if `revalidatePath` is called in the action

## Future Enhancements

- [ ] Bulk import/export settings
- [ ] Setting history and rollback
- [ ] Preview changes before saving
- [ ] Multi-language support
- [ ] Advanced theme customization
- [ ] Email template editor
- [ ] Custom CSS editor
