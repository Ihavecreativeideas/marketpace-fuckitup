# Rental Modal Debug Information for ChatGPT Assistance

## Current Problem
The rental posting modal in community.html has the following critical issues:
1. Duplicate "Price" field showing above rental rate structure (should be hidden for rental category)
2. Calendar area completely empty - no calendar displays
3. JavaScript errors for missing functions (selectAllDays, selectWeekdays, etc.)
4. Preset buttons (Weekends Only, Weekdays Only, All Days, Clear All) not working

## Key Files to Share with ChatGPT
1. `community.html` - Main file containing the rental modal and JavaScript functions
2. This debug file with specific error details

## Console Errors Being Generated
```
ReferenceError: Can't find variable: generateOwnerAvailabilityCalendar
TypeError: window.generateOwnerAvailabilityCalendar is not a function
ReferenceError: Can't find variable: selectAllDays
ReferenceError: Can't find variable: selectWeekdays
```

## What Should Work But Doesn't
1. **Calendar Display**: There should be a 7x4 grid calendar with clickable dates in the "Select Available Days" section
2. **Price Field Hiding**: When "For Rent" category is selected, the basic "Price:" field should be completely hidden
3. **Preset Buttons**: The four buttons (Weekends Only, Weekdays Only, All Days, Clear All) should populate the calendar with selected dates
4. **Date Selection**: Clicking calendar dates should highlight them and update the "Selected Dates: X days selected" counter

## HTML Elements That Should Be Connected
- `#ownerAvailabilityCalendar` - The calendar grid container
- `#priceField` - The price field that should be hidden for rentals
- `#rentalRateField` - The rental rate structure that should show for rentals
- Preset buttons with onclick handlers for selectAllDays(), selectWeekends(), etc.

## Expected Behavior for ChatGPT to Fix
1. Hide the duplicate price field when rental category is selected
2. Generate a working calendar grid with day headers (S M T W T F S) and 28 clickable date buttons
3. Make preset functions globally accessible so buttons work
4. Ensure calendar dates can be clicked to select/deselect availability
5. Update the selected dates counter and display

## Current Implementation Issues
- Functions are defined after they're called
- Multiple duplicate function definitions causing conflicts
- Window object assignments happening too late
- Calendar container exists but JavaScript isn't populating it

## Files to Extract for ChatGPT
The main issues are in community.html around lines:
- 8800-8900: Category switching logic where price field should be hidden
- 10800-11200: Calendar functions and preset button handlers
- HTML modal structure containing the rental form fields

You can copy the relevant sections of community.html to ChatGPT along with this debug information.