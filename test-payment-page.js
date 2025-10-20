/**
 * Test script to verify Payment page functionality in production
 * Run: node test-payment-page.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PRODUCTION_URL = 'https://tlpairways.up.railway.app';
const PAYMENT_PAGE_PATH = '/payment';

console.log('🧪 Testing Payment Page in Production...\n');

// Test 1: Check if Payment page loads
console.log('Test 1: Checking if Payment page loads...');
https.get(`${PRODUCTION_URL}${PAYMENT_PAGE_PATH}`, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`✅ Status Code: ${res.statusCode}`);
    
    // Test 2: Check for payment vendor options in the HTML
    console.log('\nTest 2: Checking for payment vendor options...');
    
    const paymentVendors = {
      credit: ['Visa', 'Mastercard', 'American Express', 'Diners Club', 'RuPay'],
      debit: ['Visa Debit', 'Mastercard Debit', 'RuPay Debit', 'Maestro'],
      netbanking: ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank', 
                    'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank', 'IDBI Bank']
    };
    
    let allFound = true;
    
    // Check credit card options
    console.log('\n📋 Credit Card Options:');
    paymentVendors.credit.forEach(vendor => {
      const found = data.includes(vendor);
      console.log(`   ${found ? '✅' : '❌'} ${vendor}`);
      if (!found) allFound = false;
    });
    
    // Check debit card options
    console.log('\n💳 Debit Card Options:');
    paymentVendors.debit.forEach(vendor => {
      const found = data.includes(vendor);
      console.log(`   ${found ? '✅' : '❌'} ${vendor}`);
      if (!found) allFound = false;
    });
    
    // Check net banking options
    console.log('\n🏦 Net Banking Options:');
    paymentVendors.netbanking.forEach(vendor => {
      const found = data.includes(vendor);
      console.log(`   ${found ? '✅' : '❌'} ${vendor}`);
      if (!found) allFound = false;
    });
    
    // Test 3: Check for payment method selection UI
    console.log('\nTest 3: Checking for payment method selection...');
    const hasCreditCard = data.includes('credit') && data.includes('Card Number');
    const hasDebitCard = data.includes('debit');
    const hasNetBanking = data.includes('netbanking');
    const hasUPI = data.includes('upi');
    
    console.log(`   ${hasCreditCard ? '✅' : '❌'} Credit Card option`);
    console.log(`   ${hasDebitCard ? '✅' : '❌'} Debit Card option`);
    console.log(`   ${hasNetBanking ? '✅' : '❌'} Net Banking option`);
    console.log(`   ${hasUPI ? '✅' : '❌'} UPI option`);
    
    // Test 4: Check for form fields
    console.log('\nTest 4: Checking for payment form fields...');
    const hasCardNumber = data.includes('Card Number') || data.includes('cardNumber');
    const hasExpiryDate = data.includes('Expiry Date') || data.includes('expiryDate');
    const hasCVV = data.includes('CVV') || data.includes('cvv');
    const hasBillingName = data.includes('Billing Name') || data.includes('billingName');
    
    console.log(`   ${hasCardNumber ? '✅' : '❌'} Card Number field`);
    console.log(`   ${hasExpiryDate ? '✅' : '❌'} Expiry Date field`);
    console.log(`   ${hasCVV ? '✅' : '❌'} CVV field`);
    console.log(`   ${hasBillingName ? '✅' : '❌'} Billing Name field`);
    
    // Test 5: Check for payment vendor dropdown
    console.log('\nTest 5: Checking for payment vendor dropdown...');
    const hasPaymentVendorDropdown = data.includes('Card Network') || data.includes('Bank Name') || data.includes('paymentVendor');
    console.log(`   ${hasPaymentVendorDropdown ? '✅' : '❌'} Payment Vendor dropdown`);
    
    // Test 6: Check for Adobe Data Layer
    console.log('\nTest 6: Checking for Adobe Data Layer integration...');
    const hasAdobeDataLayer = data.includes('adobeDataLayer') || data.includes('adobe');
    console.log(`   ${hasAdobeDataLayer ? '✅' : '❌'} Adobe Data Layer`);
    
    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    if (allFound && hasCreditCard && hasDebitCard && hasNetBanking && hasUPI && hasPaymentVendorDropdown) {
      console.log('✅ ALL TESTS PASSED - Payment page is working correctly!');
      console.log('\n📝 Payment Options Available:');
      console.log('   • Credit Cards: Visa, Mastercard, Amex, Diners, RuPay');
      console.log('   • Debit Cards: Visa Debit, Mastercard Debit, RuPay Debit, Maestro');
      console.log('   • Net Banking: 10 banks including HDFC, ICICI, SBI, Axis, etc.');
      console.log('   • UPI: Available');
    } else {
      console.log('❌ SOME TESTS FAILED - Payment page needs attention!');
      console.log('\n⚠️  Issues Found:');
      if (!allFound) console.log('   • Some payment vendor options are missing');
      if (!hasCreditCard) console.log('   • Credit card option not found');
      if (!hasDebitCard) console.log('   • Debit card option not found');
      if (!hasNetBanking) console.log('   • Net banking option not found');
      if (!hasUPI) console.log('   • UPI option not found');
      if (!hasPaymentVendorDropdown) console.log('   • Payment vendor dropdown not found');
    }
    
    console.log('\n🔗 Production URL:', PRODUCTION_URL);
    console.log('📅 Test Date:', new Date().toISOString());
    console.log('='.repeat(60));
    
    // Save test results to file
    const testResults = {
      timestamp: new Date().toISOString(),
      url: PRODUCTION_URL,
      statusCode: res.statusCode,
      tests: {
        paymentVendorsFound: allFound,
        creditCard: hasCreditCard,
        debitCard: hasDebitCard,
        netBanking: hasNetBanking,
        upi: hasUPI,
        paymentVendorDropdown: hasPaymentVendorDropdown,
        adobeDataLayer: hasAdobeDataLayer
      },
      allTestsPassed: allFound && hasCreditCard && hasDebitCard && hasNetBanking && hasUPI && hasPaymentVendorDropdown
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'payment-test-results.json'),
      JSON.stringify(testResults, null, 2)
    );
    
    console.log('\n💾 Test results saved to: payment-test-results.json');
  });
}).on('error', (err) => {
  console.error('❌ Error testing payment page:', err.message);
  console.error('\n⚠️  Possible issues:');
  console.error('   • Railway deployment might not be complete');
  console.error('   • URL might be incorrect');
  console.error('   • Network connectivity issue');
  process.exit(1);
});

