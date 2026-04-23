# End-to-End Order Flow Testing Guide

**Objective**: Test the complete user journey from browsing to successful order placement.

---

## BEFORE YOU START

**Prerequisites:**
- [ ] Backend running: `npm start` in `/backend` (should be on http://localhost:3001)
- [ ] Frontend running: `npm run dev` in `/frontend` (should be on http://localhost:5173)
- [ ] Database seeded with products: `npm run seed` in `/backend`
- [ ] Both terminals showing no errors

**How to check:**
```bash
# Terminal 1: Backend
cd backend
npm start
# Should show: "Server running on port 3001"

# Terminal 2: Frontend
cd frontend
npm run dev
# Should show: "Local: http://localhost:5173"
```

---

## TEST FLOW

### ✅ Step 1: Home Page Load
**Time**: 2 min

1. Open browser: http://localhost:5173
2. Should see:
   - [ ] Header with logo & cart icon
   - [ ] Weather banner (if API available)
   - [ ] Product grid with 5+ products
   - [ ] Each product shows: image, name, price, "Add to cart" button

**If broken**: Check browser console (F12) for errors.

---

### ✅ Step 2: Browse Product Detail
**Time**: 3 min

1. Click any product card
2. Should navigate to product detail page
3. Should see:
   - [ ] Product image
   - [ ] Product name
   - [ ] Product description
   - [ ] Price displayed clearly
   - [ ] **"Quick buy" button** (or "Out of Stock" if stock = 0)
   - [ ] "Order on WhatsApp" link

**Test out-of-stock**:
   - Find a product with `stock: 0` in database
   - Should see "Out of Stock" badge and disabled button

---

### ✅ Step 3: Add Items to Cart (3+ items for auto-discount)
**Time**: 3 min

1. Go back to home
2. Add 3 different products to cart:
   - Click "Add to cart" for Product A
   - Click "Add to cart" for Product B
   - Click "Add to cart" for Product C
3. Check sticky cart button (bottom-right):
   - [ ] Shows "3 items" in cart
   - [ ] Clickable
4. Click on sticky cart → opens cart
5. Should see:
   - [ ] All 3 products listed
   - [ ] Quantities (1 each)
   - [ ] Individual prices
   - [ ] **AUTO-DISCOUNT applied**: "3+ items: 5% off" 
   - [ ] Total price = (sum of prices) - 5%

**Example**:
- Product A: Rs 100
- Product B: Rs 150
- Product C: Rs 200
- Subtotal: Rs 450
- Discount (5%): Rs 22.50
- **Total should show: Rs 427.50**

---

### ✅ Step 4: Checkout Page
**Time**: 5 min

1. From cart, click "Proceed to Checkout"
2. Fill form:
   - [ ] **Name**: Enter any name (e.g., "Kuldeep Singh")
   - [ ] **Phone**: Enter 10-digit number (e.g., 9876543210)
   - [ ] **Address**: Enter full address (e.g., "123 MG Road, Bangalore")
   - [ ] **Pincode**: Enter 6-digit code

3. **Test Pincode Handling**:

   **Test A: Local Pincode** (within delivery zone)
   - Enter: **560001** (Bangalore center)
   - Delivery fee should show: **₹0** (FREE LOCAL)
   
   **Test B: Non-Local Pincode** (outside delivery zone)
   - Enter: **123456** (fake)
   - Delivery fee should show: **₹70** (OUTSIDE)

4. Check display:
   - [ ] Subtotal shown correctly
   - [ ] Discount shown (5%)
   - [ ] Delivery fee updates with pincode
   - [ ] **Grand Total = Subtotal - Discount + Delivery**

**Example for local pincode (560001)**:
```
Subtotal:     Rs 450
Discount:    -Rs 22.50 (5%)
Delivery:    +Rs 0
─────────────────────
TOTAL:       Rs 427.50
```

---

### ✅ Step 5: Place Order (COD)
**Time**: 2 min

1. Click "Place Order" button
2. Should show:
   - [ ] Loading indicator briefly
   - [ ] No error messages
   - [ ] **Redirects to Success page**

---

### ✅ Step 6: Success Page
**Time**: 2 min

Should see:
- [ ] "Order Placed Successfully" message
- [ ] Order ID displayed (e.g., "Order #507f0b...")
- [ ] Customer details shown
- [ ] Items listed
- [ ] Total amount
- [ ] "Continue shopping" button

---

### ✅ Step 7: Verify Order in Admin Panel
**Time**: 5 min

1. Open: http://localhost:3001/admin
2. Login (credentials from `.env`):
   - Email: admin@yourdomain.com (or what's in .env)
   - Password: check ADMIN_PASSWORD in .env
3. Should see:
   - [ ] Admin dashboard
   - [ ] Orders section
   - [ ] Your new order appears in list

4. Click on order:
   - [ ] Shows customer name
   - [ ] Shows phone number
   - [ ] Shows full address
   - [ ] Shows all items ordered
   - [ ] Shows exact total amount
   - [ ] Matches what user placed

---

### ✅ Step 8: Check WhatsApp Alert
**Time**: 2 min

1. **If WhatsApp enabled** (via Twilio):
   - Check your phone for WhatsApp message from Twilio
   - Should show: customer name, phone, address, items, total
   
2. **If WhatsApp mocked** (current state):
   - Check server logs in Terminal 1 (backend):
   - Should see something like:
     ```
     WhatsApp alert: sendAdminOrderAlert() called
     Order: {...}
     ```

**Note**: If using mock, this is OK for soft launch.

---

## EDGE CASE TESTS (Optional but Recommended)

### Test Case: Add duplicate items
1. Add Product A to cart
2. Add same Product A again
3. Should increase quantity to 2 (not show as 2 separate items)
4. Discount recalculates if total now 3+

### Test Case: Stock validation
1. If product stock = 1
2. Try adding 5 units
3. Should only allow 1 on checkout
4. Show warning: "Only X in stock"

### Test Case: Mobile responsiveness
1. Open on phone (or use Chrome DevTools)
2. Check:
   - [ ] Buttons are clickable size
   - [ ] Text readable
   - [ ] No horizontal scroll
   - [ ] Images load
   - [ ] Form fields big enough to type in

---

## Debugging Checklist

| Issue | Check |
|-------|-------|
| Can't load products | Is backend running? `npm start` in backend |
| Cart not showing items | Check browser console (F12) for JS errors |
| Discount not applying | Add exactly 3+ items; check pricingService.js |
| Admin login fails | Check .env ADMIN_EMAIL and ADMIN_PASSWORD |
| WhatsApp not working | Check server logs; is WHATSAPP_ADMIN_NUMBER set? |
| Pincode delivery fee not changing | Is DeliveryZone database updated? |
| Out of stock button disabled? | Check product stock in database > 0 |

---

## Success Checklist

✅ Complete this entire test flow
✅ No errors in browser console
✅ No errors in server logs
✅ All 8 steps completed without issues
✅ Order appears in admin panel
✅ Mobile looks usable

**If all ✅**: You're ready to soft launch! 🚀

---

## Quick Reset (if needed)

```bash
# Reset database
cd backend
npm run seed

# Kill and restart servers
# Ctrl+C in both terminals
npm start     # Terminal 1
npm run dev   # Terminal 2
```

---

## Real User Testing Tips

When sharing with family/friends:
- Ask them to **not use dummy data**
- Use real pincodes for their area
- Watch where they get confused (note for Phase 2)
- Ask: "Would you buy from this?"
