// Unique explanatory text and FAQs for the Calculator Hub tool pages.
const content = {
  "percentage-calculator": {
    about: "Percentages show up everywhere — exam marks, salary hikes, discounts, interest and growth figures. This calculator covers the common questions in one place: what is X% of Y, X is what percent of Y, and the percentage increase or decrease between two numbers. Every answer updates as you type, so you can check several numbers quickly.",
    faq: [
      ["How do I calculate a percentage of a number?", "Multiply the number by the percentage and divide by 100. For example, 18% of 2,500 = 2,500 × 18 ÷ 100 = 450."],
      ["How is percentage change calculated?", "Subtract the old value from the new value, divide by the old value and multiply by 100. Going from 80 to 100 is a 25% increase."],
      ["How do I calculate my exam percentage?", "Divide the marks you scored by the total marks and multiply by 100. 425 out of 500 is 85%."],
    ],
  },
  "gst-calculator": {
    about: "Goods and Services Tax (GST) is charged on most goods and services in India. Within a state, GST is split equally into CGST and SGST; for sales between states, the full amount is charged as IGST. Use this calculator to add GST to a base price or to work backwards from a GST-inclusive price, with the tax breakdown shown for each rate.",
    faq: [
      ["How do I remove GST from an inclusive price?", "Divide the price by (1 + rate ÷ 100). At 18%, a price of ₹1,180 includes ₹1,000 plus ₹180 GST."],
      ["What is the difference between CGST, SGST and IGST?", "CGST and SGST each take half the tax on sales within a state. IGST is the full tax on sales between states or imports."],
      ["Which GST rate applies to my product?", "The rate depends on the HSN or SAC code of the goods or service. Rates change from time to time, so check the latest notification or ask a tax professional."],
    ],
  },
  "emi-calculator": {
    about: "An EMI (equated monthly instalment) is the fixed amount you pay each month to repay a loan with interest. It is calculated as EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1), where P is the loan amount, r is the monthly interest rate and n is the number of months. Enter the amount, rate and tenure to see the EMI, total interest and a month-by-month repayment schedule.",
    faq: [
      ["How does tenure affect my EMI?", "A longer tenure lowers the EMI but increases the total interest you pay over the life of the loan."],
      ["Why is most of my early EMI interest?", "Interest is charged on the outstanding balance, which is highest at the start. As the principal reduces, more of each EMI goes towards it."],
      ["Is the result the same as my bank's EMI?", "It uses the standard reducing-balance formula. Your bank's figure may differ slightly due to processing fees, insurance or rounding."],
    ],
  },
  "age-calculator": {
    about: "Calculating an exact age by hand is tricky because months have different lengths and leap years add an extra day. Enter a date of birth to see the age in years, months and days, the total number of days lived and how long it is until the next birthday. You can also calculate age on a specific date, which is useful for exam and job eligibility cut-off dates.",
    faq: [
      ["How is age calculated for eligibility forms?", "Age is counted in completed years, months and days up to the cut-off date mentioned in the notification. Set that date as the 'age on' date."],
      ["How are leap-year birthdays handled?", "For people born on 29 February, the age increases on 28 February or 1 March in non-leap years depending on local convention; the calculator counts completed calendar days."],
      ["Is my date of birth stored?", "No. The calculation happens in your browser and nothing is saved."],
    ],
  },
  "salary-calculator": {
    about: "Your cost to company (CTC) is not what reaches your bank account. Employer and employee PF contributions, professional tax and income tax are deducted first. This calculator estimates monthly in-hand salary from your CTC for FY 2025-26 and compares the new and old tax regimes. Under the new regime, salaried income up to ₹12.75 lakh (₹12 lakh plus the ₹75,000 standard deduction) attracts no income tax.",
    faq: [
      ["Which tax regime is better for me?", "The new regime has lower rates and fewer deductions. The old regime can be better if you claim large deductions such as 80C, HRA and home-loan interest. Compare both results."],
      ["Why is my in-hand salary lower than CTC ÷ 12?", "CTC includes employer PF, gratuity and sometimes bonuses or insurance, and income tax and professional tax are deducted from your pay."],
      ["Is this calculation exact?", "It is an estimate using standard assumptions. Your actual salary depends on your company's salary structure and declarations."],
    ],
  },
  "discount-calculator": {
    about: "Sale tags such as '40% off + extra 10%' are not the same as 50% off. This calculator works out the final price after one or more discounts, how much you save and the effective discount rate, and can add tax on top. It is handy for comparing offers while shopping online or in stores.",
    faq: [
      ["Is 40% + 10% off the same as 50% off?", "No. The second discount applies to the already reduced price, so 40% then 10% is a 46% total discount."],
      ["How do I calculate the original price from a sale price?", "Divide the sale price by (1 − discount ÷ 100). A ₹600 price after 25% off was originally ₹800."],
      ["Should tax be added before or after the discount?", "In India GST is usually charged on the discounted selling price, so apply the discount first."],
    ],
  },
  "date-difference-calculator": {
    about: "Find the exact number of days, weeks, months and years between two dates — for notice periods, project deadlines, rent agreements or counting down to an event. You can also add or subtract days, weeks or months from a date to find a due date. Leap years and different month lengths are handled automatically.",
    faq: [
      ["Does the result include the end date?", "By default the difference counts the days between the dates. Add one day if you need to include both the start and end dates."],
      ["How do I find a date 90 days from today?", "Use the add/subtract option, choose today's date and add 90 days."],
      ["Can it count only working days?", "Use the Working Days Calculator to exclude weekends and holidays."],
    ],
  },
  "time-duration-calculator": {
    about: "Work out how long a shift, class or journey lasted, even when it runs past midnight, and subtract break time to get net hours. A second mode adds and subtracts a list of durations, which is useful for timesheets, video edits and workout logs. Results are shown as hours and minutes, decimal hours and total minutes.",
    faq: [
      ["How do I convert minutes to decimal hours?", "Divide the minutes by 60. For example 7 hours 45 minutes is 7.75 hours."],
      ["How are overnight shifts calculated?", "If the end time is earlier than the start time, the calculator assumes the shift crosses midnight and adds 24 hours."],
      ["Can I calculate pay from hours worked?", "Yes. Enter an optional hourly rate to see the earnings for the duration."],
    ],
  },
  "working-days-calculator": {
    about: "Business deadlines, notice periods and delivery dates are often counted in working days, not calendar days. Count the weekdays between two dates while excluding weekends and holidays, or add a number of working days to a start date. You can choose which days are the weekend and add your own holiday list, since many festival dates change every year.",
    faq: [
      ["Does it include Indian public holidays?", "Fixed-date national holidays can be included. Festivals that change every year should be added to the holiday list yourself."],
      ["Can I use a six-day working week?", "Yes. Choose only Sunday as the weekend, or any combination of weekend days."],
      ["Are the start and end dates counted?", "Both dates are included when they are working days."],
    ],
  },
  "time-zone-converter": {
    about: "Scheduling calls across countries is easy to get wrong, especially when daylight saving time starts or ends. Convert a date and time from one time zone to many others at once, including IST, UTC, GMT, EST, PST and over 400 IANA time zones. Daylight saving is handled by your browser's built-in time-zone database.",
    faq: [
      ["What is IST in UTC?", "India Standard Time is UTC+5:30 all year. India does not use daylight saving time."],
      ["What is the difference between GMT and UTC?", "For everyday use they show the same time. UTC is the precise scientific standard; GMT is the time zone used in the UK in winter."],
      ["Why does the difference between India and the USA change during the year?", "The USA moves its clocks forward in summer, while India does not, so the gap shrinks by an hour during US daylight saving time."],
    ],
  },
  "loan-prepayment-calculator": {
    about: "Paying a little extra towards a loan reduces the principal, so you pay less interest overall. This calculator shows the effect of a one-time lump sum or regular prepayments and compares two choices: keep the same EMI and finish the loan sooner, or keep the tenure and reduce the EMI. Reducing tenure usually saves more interest.",
    faq: [
      ["Is it better to reduce EMI or tenure?", "Reducing tenure generally saves more interest. Reducing the EMI helps if you need lower monthly payments."],
      ["Are there prepayment charges?", "In India, banks cannot charge prepayment penalties on floating-rate home loans taken by individuals. Fixed-rate and other loans may have charges — check your agreement."],
      ["When is the best time to prepay?", "Earlier is better, because more of each EMI goes to interest in the early years."],
    ],
  },
  "recipe-quantity-calculator": {
    about: "Cooking for more or fewer people means multiplying every ingredient by the same factor, which gets awkward with fractions like ¾ cup. Paste your ingredient list, enter the original and new number of servings, and the calculator scales each quantity and shows tidy fractions. It works with cups, spoons, grams, millilitres and countable items.",
    faq: [
      ["Can I scale baking recipes the same way?", "Ingredients scale proportionally, but baking times and pan sizes may need adjusting for much larger or smaller batches."],
      ["How should I write the ingredient list?", "Put one ingredient per line with the quantity first, for example '1 1/2 cups flour'."],
      ["Does it convert between cups and grams?", "No. It scales quantities in the units you entered. Use the Unit Converter for volume and weight conversions."],
    ],
  },
  "fuel-cost-calculator": {
    about: "Plan a road trip or daily commute by estimating how much petrol, diesel or CNG you will use and what it will cost. Enter the distance, your vehicle's mileage and the current fuel price; you can calculate a return journey and split the cost between passengers. Results are shown in litres (or kg for CNG) and rupees.",
    faq: [
      ["How is fuel cost calculated?", "Fuel needed = distance ÷ mileage. Cost = fuel needed × price per litre. 300 km at 15 km/l and ₹100/l costs ₹2,000."],
      ["Why is my real mileage lower than the company figure?", "Traffic, speed, AC use, tyre pressure and load all affect real-world mileage. Use your own observed figure for better estimates."],
      ["Can I split the cost among friends?", "Yes. Enter the number of people to see the cost per person."],
    ],
  },
  "split-bill-calculator": {
    about: "Splitting a restaurant bill or trip expense fairly is simple when everyone pays the same, but harder when people ordered different things. Split equally or item by item, and share tax, service charge and tip in proportion to what each person had. The result shows exactly how much each person owes.",
    faq: [
      ["How are tax and tip shared in an itemised split?", "They are divided in proportion to each person's subtotal, so someone who ordered more pays a larger share."],
      ["Is service charge mandatory in Indian restaurants?", "No. Under consumer guidelines, service charge is voluntary and you can ask for it to be removed."],
      ["Can I split shared dishes?", "Yes. Assign a shared item to several people and its cost is divided between them."],
    ],
  },
  "online-calculator": {
    about: "A full-featured calculator that runs in your browser, with a basic mode for everyday sums and a scientific mode with powers, roots, trigonometry and logarithms. Memory keys and a calculation history let you reuse earlier results, and you can type with your keyboard as well as click the buttons.",
    faq: [
      ["Does the calculator follow BODMAS?", "Yes. Expressions follow the standard order of operations: brackets, powers, division and multiplication, then addition and subtraction."],
      ["Are trigonometric functions in degrees or radians?", "You can switch between degrees and radians in scientific mode."],
      ["Can I use my keyboard?", "Yes. Type numbers and operators, press Enter for the result and Backspace to delete."],
    ],
  },
  "unit-converter": {
    about: "Convert between metric, imperial and Indian units in one place: length, weight, volume, temperature, area, speed, time, data size, pressure and energy, plus binary, octal, decimal and hexadecimal numbers. The land tab converts traditional units such as Bigha, Kattha and Dhur to acres, hectares, decimals, square feet and square metres. Because Bigha sizes differ by state, you can choose Bihar/Jharkhand, West Bengal, Assam, Nepal Terai or enter your own local size.",
    faq: [
      ["How many square feet are in 1 Bigha?", "It depends on the region. In Bihar and Jharkhand 1 Bigha is commonly 27,225 sq ft, in West Bengal and Assam 14,400 sq ft, and in the Nepal Terai 72,900 sq ft. Always confirm with your local land records."],
      ["How many square feet are in 1 Kattha and 1 Decimal?", "In Bihar 1 Kattha is about 1,361.25 sq ft (1/20 of a Bigha). 1 Decimal is 1/100 of an acre, which is 435.6 sq ft everywhere."],
      ["Is 1 GB 1000 MB or 1024 MB?", "Storage makers use 1 GB = 1000 MB. Windows reports sizes in binary units where 1 GiB = 1024 MiB, which is why a 1 TB drive shows about 931 GB."],
    ],
  },
};

export default content;
