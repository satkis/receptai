# 🔒 Private Test Environment Setup

This guide explains how to set up `test.ragaujam.lt` as a private, password-protected environment that's not accessible to the public.

## 🛡️ Protection Methods

### **Method 1: Password Protection (Recommended)**
- Simple password-based access control
- Works with any device/location
- Easy to share with team members
- Implemented via Next.js middleware

### **Method 2: IP Whitelist**
- Restrict access to specific IP addresses
- More secure but less flexible
- Good for office/home-only access
- Can be combined with password protection

### **Method 3: Vercel Password Protection**
- Built-in Vercel feature
- Simplest to set up
- Basic HTTP authentication
- Good for quick testing

## 🔧 Implementation

### **Current Setup (Method 1 + 2)**

The test environment uses custom middleware with:
- **Password protection** with custom login page
- **IP whitelist** (optional)
- **SEO blocking** (noindex, nofollow)
- **24-hour authentication cookies**

### **Configuration in `.env.test`**

```env
# Password Protection
VERCEL_PASSWORD_PROTECT=true
VERCEL_PASSWORD=your-secure-test-password-123

# IP Whitelist Protection (optional)
ENABLE_IP_WHITELIST=true
ALLOWED_IPS=your.home.ip.address,your.office.ip.address,127.0.0.1
```

## 🚀 Deployment Setup

### **Step 1: Deploy Test Environment**

```bash
# Switch to test environment
npm run env:test

# Deploy to Vercel with test configuration
vercel --prod --local-config vercel.test.json
```

### **Step 2: Configure Domain**

In your domain registrar (iv.lt), add DNS record:
```
Type: CNAME
Name: test
Value: cname.vercel-dns.com
TTL: 300
```

### **Step 3: Set Environment Variables in Vercel**

In Vercel dashboard for test project:
```
NODE_ENV=test
VERCEL_PASSWORD_PROTECT=true
VERCEL_PASSWORD=your-secure-password
ENABLE_IP_WHITELIST=false
MONGODB_URI=your-test-mongodb-uri
AWS_S3_BUCKET=ragaujam-test-images
```

### **Step 4: Configure Custom Domain**

In Vercel project settings:
1. Go to "Domains"
2. Add `test.ragaujam.lt`
3. Verify DNS configuration

## 🔐 Access Control Options

### **Option A: Password Only (Recommended)**
```env
VERCEL_PASSWORD_PROTECT=true
VERCEL_PASSWORD=SecureTestPassword123!
ENABLE_IP_WHITELIST=false
```

**Pros:**
- ✅ Easy to share with team
- ✅ Works from anywhere
- ✅ Simple to manage

**Cons:**
- ❌ Password can be shared
- ❌ Less secure than IP whitelist

### **Option B: IP Whitelist Only**
```env
VERCEL_PASSWORD_PROTECT=false
ENABLE_IP_WHITELIST=true
ALLOWED_IPS=203.0.113.1,203.0.113.2
```

**Pros:**
- ✅ Very secure
- ✅ No passwords to manage
- ✅ Automatic access from allowed IPs

**Cons:**
- ❌ Limited to specific locations
- ❌ Difficult for remote work
- ❌ IP addresses can change

### **Option C: Both (Maximum Security)**
```env
VERCEL_PASSWORD_PROTECT=true
VERCEL_PASSWORD=SecureTestPassword123!
ENABLE_IP_WHITELIST=true
ALLOWED_IPS=203.0.113.1,203.0.113.2
```

**Pros:**
- ✅ Maximum security
- ✅ Two-factor protection
- ✅ Flexible access control

**Cons:**
- ❌ More complex setup
- ❌ Can be inconvenient

## 🌐 Alternative: Vercel Built-in Protection

For simpler setup, use Vercel's built-in password protection:

### **In Vercel Dashboard:**
1. Go to project settings
2. Navigate to "General" → "Password Protection"
3. Enable and set password
4. Deploy

### **Pros:**
- ✅ Very simple setup
- ✅ No code changes needed
- ✅ Managed by Vercel

### **Cons:**
- ❌ Basic HTTP auth (ugly browser popup)
- ❌ Less customizable
- ❌ No IP whitelist option

## 🔍 SEO Protection

The test environment automatically includes:

```html
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
```

And HTTP headers:
```
X-Robots-Tag: noindex, nofollow, noarchive, nosnippet
```

This prevents search engines from indexing the test site.

## 🧪 Testing Access Control

### **Test Password Protection:**
1. Visit `https://test.ragaujam.lt`
2. Should see custom login page
3. Enter correct password
4. Should redirect to main site
5. Try wrong password - should stay on login

### **Test IP Whitelist:**
1. Enable IP whitelist with your IP
2. Visit site - should work normally
3. Use VPN/different IP
4. Should see "Access Denied" message

### **Test SEO Blocking:**
1. Check page source for robots meta tag
2. Verify X-Robots-Tag header
3. Test with SEO tools (should show "noindex")

## 🔧 Troubleshooting

### **Can't Access Test Site**
```bash
# Check your current IP
curl ifconfig.me

# Add your IP to whitelist
ALLOWED_IPS=your.current.ip.address,127.0.0.1
```

### **Password Not Working**
1. Check environment variables in Vercel
2. Verify password in `.env.test`
3. Clear browser cookies
4. Try incognito/private mode

### **Domain Not Working**
1. Check DNS propagation: `nslookup test.ragaujam.lt`
2. Verify CNAME record points to Vercel
3. Check Vercel domain configuration
4. Wait for DNS propagation (up to 24 hours)

## 📋 Deployment Checklist

- [ ] Test environment configured in `.env.test`
- [ ] Password protection enabled
- [ ] IP whitelist configured (if needed)
- [ ] Vercel project created for test
- [ ] Environment variables set in Vercel
- [ ] DNS CNAME record added
- [ ] Custom domain configured in Vercel
- [ ] Access control tested
- [ ] SEO blocking verified
- [ ] Team members can access with password

## 🔄 Managing Access

### **Adding Team Members:**
1. Share the password securely (1Password, etc.)
2. Or add their IP to whitelist
3. Document who has access

### **Changing Password:**
1. Update in Vercel environment variables
2. Update in `.env.test`
3. Redeploy
4. Notify team of new password

### **Removing Access:**
1. Change password
2. Remove IP from whitelist
3. Redeploy

---

**Security Level**: Private ✅  
**Public Access**: Blocked ❌  
**Search Engine Indexing**: Blocked ❌
