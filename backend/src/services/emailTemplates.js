/**
 * Enhanced Email Templates for TLP Airways
 * Industry-standard booking confirmation with all sections
 */

const {
  calculateDuration,
  calculateWebCheckinOpens,
  calculateReportingTime,
  calculateGateClosing,
  formatDate,
  formatDateTime,
  extractTime
} = require('../utils/emailHelpers');

/**
 * Generate comprehensive booking confirmation email HTML
 * @param {Object} bookingData - Complete booking information
 * @returns {string} HTML email template
 */
function generateBookingConfirmationEmail(bookingData) {
  const {
    // Passenger Information
    passengerName = 'Guest',
    email = '',
    phone = 'Not provided',
    
    // Booking Reference
    bookingId = 'N/A',
    pnr = 'N/A',
    bookingDate = new Date().toISOString(),
    bookingStatus = 'Confirmed',
    tripType = 'oneway', // oneway or roundtrip
    
    // Flight Details
    flightNumber = 'N/A',
    airline = 'TLP Airways',
    aircraftType = 'Boeing 737-800',
    
    // Route Information
    from = 'N/A',
    fromCity = '',
    fromAirport = '',
    fromTerminal = 'TBD',
    to = 'N/A',
    toCity = '',
    toAirport = '',
    toTerminal = 'TBD',
    route = 'N/A',
    
    // Timing
    travelDate = 'N/A',
    departureTime = '10:30',
    arrivalTime = '12:45',
    duration = '2h 15m',
    
    // Return Flight (for round trips)
    returnFlight = null,
    
    // Passengers
    adults = 1,
    children = 0,
    infants = 0,
    totalPassengers = 1,
    passengers = [],
    
    // Class & Fare
    travelClass = 'Economy',
    fareType = 'Regular',
    
    // Pricing
    baseFare = 0,
    taxes = 0,
    totalAmount = 0,
    currency = 'INR',
    paymentMethod = 'Credit Card',
    paymentStatus = 'Paid',
    
    // Baggage
    cabinBaggage = '7 kg',
    checkinBaggage = '15 kg',
    
    // Check-in Information
    webCheckinOpens = '',
    reportingTime = '',
    gateClosingTime = '',
    
    // Links
    bookingUrl = '',
    checkinUrl = '',
    eTicketUrl = '',
    manageBookingUrl = ''
  } = bookingData;

  // Format dates and times
  const formattedTravelDate = formatDate(travelDate);
  const formattedBookingDate = formatDate(bookingDate);
  const routeDisplay = route !== 'N/A' ? route.replace('-', ' → ') : 
    (from !== 'N/A' && to !== 'N/A' ? `${from} → ${to}` : 'N/A');
  
  // Calculate times if not provided
  const finalDepartureTime = extractTime(departureTime);
  const finalArrivalTime = extractTime(arrivalTime);
  const finalDuration = duration || calculateDuration(departureTime, arrivalTime);
  const finalReportingTime = reportingTime || calculateReportingTime(finalDepartureTime);
  const finalGateClosing = gateClosingTime || calculateGateClosing(finalDepartureTime);
  const finalWebCheckin = webCheckinOpens || calculateWebCheckinOpens(travelDate, finalDepartureTime);
  const formattedWebCheckin = formatDateTime(travelDate, finalDepartureTime);

  // Build passenger list HTML
  const passengersList = passengers.length > 0 ? passengers : [{
    name: passengerName,
    type: 'Adult',
    age: null,
    seatNumber: null,
    mealPreference: null
  }];

  const passengersHTML = passengersList.map(p => {
    const seatBadge = p.seatNumber ? `
      <div style="background: #14B8A6; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; display: inline-block; margin-bottom: 5px;">
        Seat ${p.seatNumber}
      </div>
    ` : '';
    const mealInfo = p.mealPreference ? `
      <div style="color: #6B7280; font-size: 12px; margin-top: 5px;">
        🍽️ ${p.mealPreference}
      </div>
    ` : '';
    
    return `
      <div style="background: #F9FAFB; padding: 15px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #14B8A6;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-weight: bold; color: #134E4A; font-size: 16px; margin-bottom: 5px;">
              ${p.name}
            </div>
            <div style="color: #6B7280; font-size: 14px;">
              ${p.type}${p.age ? `, Age ${p.age}` : ''}
            </div>
          </div>
          <div style="text-align: right;">
            ${seatBadge}
            ${mealInfo}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Build URLs
  const baseUrl = 'https://tlpairways.thelearningproject.in';
  const finalBookingUrl = bookingUrl || `${baseUrl}/my-bookings/${bookingId}`;
  const finalCheckinUrl = checkinUrl || `${baseUrl}/web-checkin/${bookingId}`;
  const finalETicketUrl = eTicketUrl || `${baseUrl}/download-ticket/${bookingId}`;
  const finalManageUrl = manageBookingUrl || `${baseUrl}/manage-booking/${bookingId}`;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Booking Confirmed - TLP Airways</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #F9FAFB; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F9FAFB;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(20, 184, 166, 0.1);">
          
          <!-- SECTION 1: HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #14B8A6 0%, #0F766E 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <div style="font-size: 48px; line-height: 1; margin-bottom: 10px;">✈️</div>
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #FFFFFF; line-height: 1.3; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                Booking Confirmed!
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; color: #5EEAD4; font-weight: 500; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                TLP Airways
              </p>
              <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 20px; border-radius: 20px; margin-top: 15px;">
                <span style="color: #FFFFFF; font-weight: bold; font-size: 16px;">
                  Booking ID: ${bookingId}
                </span>
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px 30px; background-color: #FFFFFF;">
              <p style="margin: 0 0 10px 0; font-size: 16px; line-height: 1.6; color: #134E4A; font-weight: 500; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                Hi ${passengerName},
              </p>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #6B7280; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                Your flight booking is confirmed! Here are your booking details:
              </p>
            </td>
          </tr>

          <!-- SECTION 2: FLIGHT SUMMARY -->
          <tr>
            <td style="padding: 0 30px 30px 30px; background-color: #FFFFFF;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F0FDFA; border-left: 4px solid #14B8A6; border-radius: 8px; box-shadow: 0 1px 3px rgba(20, 184, 166, 0.1);">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: bold; color: #134E4A; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                      Flight Summary
                    </h2>
                    
                    <!-- Flight Number & Date -->
                    <div style="margin-bottom: 20px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 24px; font-weight: bold; color: #134E4A;">
                          ${flightNumber}
                        </span>
                        <span style="color: #6B7280; font-size: 14px;">
                          ${formattedTravelDate}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Route Timeline -->
                    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="width: 35%; text-align: left;">
                            <div style="font-size: 28px; font-weight: bold; color: #134E4A;">
                              ${finalDepartureTime}
                            </div>
                            <div style="color: #6B7280; font-size: 14px; margin-top: 5px;">
                              ${fromCity || from} (${from})
                            </div>
                            <div style="color: #9CA3AF; font-size: 12px;">
                              ${fromTerminal}
                            </div>
                          </td>
                          
                          <td style="width: 30%; text-align: center;">
                            <div style="color: #9CA3AF; font-size: 12px; margin-bottom: 5px;">
                              ${finalDuration}
                            </div>
                            <div style="border-top: 2px solid #14B8A6; position: relative; margin: 0 10px;">
                              <div style="background: #14B8A6; width: 8px; height: 8px; border-radius: 50%; position: absolute; right: -4px; top: -5px;"></div>
                            </div>
                            <div style="color: #9CA3AF; font-size: 12px; margin-top: 5px;">
                              Direct Flight
                            </div>
                          </td>
                          
                          <td style="width: 35%; text-align: right;">
                            <div style="font-size: 28px; font-weight: bold; color: #134E4A;">
                              ${finalArrivalTime}
                            </div>
                            <div style="color: #6B7280; font-size: 14px; margin-top: 5px;">
                              ${toCity || to} (${to})
                            </div>
                            <div style="color: #9CA3AF; font-size: 12px;">
                              ${toTerminal}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Class & Status -->
                    <div style="display: flex; gap: 10px;">
                      <div style="background: white; padding: 10px 15px; border-radius: 6px; flex: 1;">
                        <span style="color: #6B7280; font-size: 12px;">Class</span>
                        <div style="color: #134E4A; font-weight: bold; font-size: 14px;">
                          ${travelClass}
                        </div>
                      </div>
                      <div style="background: white; padding: 10px 15px; border-radius: 6px; flex: 1;">
                        <span style="color: #6B7280; font-size: 12px;">Status</span>
                        <div style="color: #10B981; font-weight: bold; font-size: 14px;">
                          ✓ ${bookingStatus}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${returnFlight ? `
          <!-- RETURN FLIGHT SUMMARY (Round Trip) -->
          <tr>
            <td style="padding: 0 30px 30px 30px; background-color: #FFFFFF;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F0FDFA; border-left: 4px solid #F97316; border-radius: 8px; box-shadow: 0 1px 3px rgba(249, 115, 22, 0.1);">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: bold; color: #134E4A; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                      Return Flight
                    </h2>
                    
                    <!-- Flight Number & Date -->
                    <div style="margin-bottom: 20px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 24px; font-weight: bold; color: #134E4A;">
                          ${returnFlight.flightNumber || 'N/A'}
                        </span>
                        <span style="color: #6B7280; font-size: 14px;">
                          ${formatDate(returnFlight.travelDate)}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Route Timeline -->
                    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="width: 35%; text-align: left;">
                            <div style="font-size: 28px; font-weight: bold; color: #134E4A;">
                              ${extractTime(returnFlight.departureTime)}
                            </div>
                            <div style="color: #6B7280; font-size: 14px; margin-top: 5px;">
                              ${returnFlight.fromCity || returnFlight.from} (${returnFlight.from})
                            </div>
                            <div style="color: #9CA3AF; font-size: 12px;">
                              ${returnFlight.fromTerminal || 'TBD'}
                            </div>
                          </td>
                          
                          <td style="width: 30%; text-align: center;">
                            <div style="color: #9CA3AF; font-size: 12px; margin-bottom: 5px;">
                              ${returnFlight.duration || calculateDuration(returnFlight.departureTime, returnFlight.arrivalTime)}
                            </div>
                            <div style="border-top: 2px solid #F97316; position: relative; margin: 0 10px;">
                              <div style="background: #F97316; width: 8px; height: 8px; border-radius: 50%; position: absolute; right: -4px; top: -5px;"></div>
                            </div>
                            <div style="color: #9CA3AF; font-size: 12px; margin-top: 5px;">
                              Direct Flight
                            </div>
                          </td>
                          
                          <td style="width: 35%; text-align: right;">
                            <div style="font-size: 28px; font-weight: bold; color: #134E4A;">
                              ${extractTime(returnFlight.arrivalTime)}
                            </div>
                            <div style="color: #6B7280; font-size: 14px; margin-top: 5px;">
                              ${returnFlight.toCity || returnFlight.to} (${returnFlight.to})
                            </div>
                            <div style="color: #9CA3AF; font-size: 12px;">
                              ${returnFlight.toTerminal || 'TBD'}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Class & Status -->
                    <div style="display: flex; gap: 10px;">
                      <div style="background: white; padding: 10px 15px; border-radius: 6px; flex: 1;">
                        <span style="color: #6B7280; font-size: 12px;">Class</span>
                        <div style="color: #134E4A; font-weight: bold; font-size: 14px;">
                          ${returnFlight.travelClass || travelClass}
                        </div>
                      </div>
                      <div style="background: white; padding: 10px 15px; border-radius: 6px; flex: 1;">
                        <span style="color: #6B7280; font-size: 12px;">Status</span>
                        <div style="color: #10B981; font-weight: bold; font-size: 14px;">
                          ✓ ${bookingStatus}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- SECTION 3: PASSENGER DETAILS -->
          <tr>
            <td style="padding: 0 30px 30px 30px; background-color: #FFFFFF;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #CCFBF1; border-radius: 8px;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #134E4A; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                      Passenger Details
                    </h3>
                    ${passengersHTML}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SECTION 4: BOOKING INFORMATION -->
          <tr>
            <td style="padding: 0 30px 30px 30px; background-color: #FFFFFF;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #CCFBF1; border-radius: 8px;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #134E4A; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                      Booking Information
                    </h3>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="color: #6B7280; width: 40%; padding: 8px 0; font-size: 14px;">Booking ID / PNR:</td>
                        <td style="color: #134E4A; font-weight: bold; padding: 8px 0; font-size: 14px;">${bookingId}</td>
                      </tr>
                      <tr>
                        <td style="color: #6B7280; padding: 8px 0; font-size: 14px;">Booked On:</td>
                        <td style="color: #134E4A; padding: 8px 0; font-size: 14px;">${formattedBookingDate}</td>
                      </tr>
                      <tr>
                        <td style="color: #6B7280; padding: 8px 0; font-size: 14px;">Total Passengers:</td>
                        <td style="color: #134E4A; padding: 8px 0; font-size: 14px;">${totalPassengers}</td>
                      </tr>
                      <tr>
                        <td style="color: #6B7280; padding: 8px 0; font-size: 14px;">Contact Email:</td>
                        <td style="color: #134E4A; padding: 8px 0; font-size: 14px;">${email}</td>
                      </tr>
                      <tr>
                        <td style="color: #6B7280; padding: 8px 0; font-size: 14px;">Contact Phone:</td>
                        <td style="color: #134E4A; padding: 8px 0; font-size: 14px;">${phone}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SECTION 5: PAYMENT SUMMARY -->
          <tr>
            <td style="padding: 0 30px 30px 30px; background-color: #FFFFFF;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F0FDFA; border-left: 4px solid #F97316; border-radius: 8px;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #134E4A; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                      Payment Summary
                    </h3>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="color: #6B7280; padding: 8px 0; font-size: 14px;">Base Fare</td>
                        <td style="color: #134E4A; text-align: right; padding: 8px 0; font-size: 14px;">${formatCurrency(baseFare)}</td>
                      </tr>
                      <tr>
                        <td style="color: #6B7280; padding: 8px 0; font-size: 14px;">Taxes & Fees</td>
                        <td style="color: #134E4A; text-align: right; padding: 8px 0; font-size: 14px;">${formatCurrency(taxes)}</td>
                      </tr>
                      <tr>
                        <td style="border-top: 2px solid #CCFBF1; color: #134E4A; font-weight: bold; padding: 12px 0 0 0; font-size: 18px;">Total Amount Paid</td>
                        <td style="border-top: 2px solid #CCFBF1; color: #134E4A; font-weight: bold; text-align: right; padding: 12px 0 0 0; font-size: 18px;">${formatCurrency(totalAmount)}</td>
                      </tr>
                      <tr>
                        <td style="color: #6B7280; padding: 8px 0; font-size: 14px;">Payment Method</td>
                        <td style="color: #10B981; text-align: right; padding: 8px 0; font-size: 14px;">✓ ${paymentMethod} (${paymentStatus})</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SECTION 6: BAGGAGE ALLOWANCE -->
          <tr>
            <td style="padding: 0 30px 30px 30px; background-color: #FFFFFF;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #CCFBF1; border-radius: 8px;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #134E4A; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                      🧳 Baggage Allowance
                    </h3>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="width: 50%; padding-right: 10px;">
                          <div style="background: #F9FAFB; padding: 15px; border-radius: 6px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 10px;">👜</div>
                            <div style="color: #6B7280; font-size: 14px; margin-bottom: 5px;">Cabin Baggage</div>
                            <div style="color: #134E4A; font-weight: bold; font-size: 18px;">${cabinBaggage}</div>
                          </div>
                        </td>
                        <td style="width: 50%; padding-left: 10px;">
                          <div style="background: #F9FAFB; padding: 15px; border-radius: 6px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 10px;">🧳</div>
                            <div style="color: #6B7280; font-size: 14px; margin-bottom: 5px;">Check-in Baggage</div>
                            <div style="color: #134E4A; font-weight: bold; font-size: 18px;">${checkinBaggage}</div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SECTION 7: CHECK-IN INFORMATION -->
          <tr>
            <td style="padding: 0 30px 30px 30px; background-color: #FFFFFF;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFF7ED; border-left: 4px solid #F97316; border-radius: 8px;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #134E4A; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                      ✓ Check-in Information
                    </h3>
                    <div style="margin-bottom: 15px;">
                      <div style="color: #6B7280; font-size: 14px; margin-bottom: 5px;">Web Check-in Opens</div>
                      <div style="color: #134E4A; font-weight: bold; font-size: 16px;">${formattedWebCheckin} (24 hours before departure)</div>
                    </div>
                    <div style="margin-bottom: 15px;">
                      <div style="color: #6B7280; font-size: 14px; margin-bottom: 5px;">Airport Reporting Time</div>
                      <div style="color: #EA580C; font-weight: bold; font-size: 16px;">${finalReportingTime} (2 hours before departure)</div>
                    </div>
                    <div style="margin-bottom: 20px;">
                      <div style="color: #6B7280; font-size: 14px; margin-bottom: 5px;">Gate Closing Time</div>
                      <div style="color: #DC2626; font-weight: bold; font-size: 16px;">${finalGateClosing} (Boarding closes 15 min before)</div>
                    </div>
                    <div style="text-align: center;">
                      <a href="${finalCheckinUrl}" style="background: #F97316; color: #FFFFFF; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 14px;">
                        Web Check-in (Available 24h before)
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SECTION 8: QUICK ACTIONS -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center; background-color: #FFFFFF;">
              <h3 style="color: #134E4A; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">Quick Actions</h3>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="padding: 0 5px;">
                    <a href="${finalBookingUrl}" style="background: #F97316; color: #FFFFFF; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                      📋 View My Booking
                    </a>
                  </td>
                  <td style="padding: 0 5px;">
                    <a href="${finalETicketUrl}" style="background: #14B8A6; color: #FFFFFF; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                      📥 Download E-Ticket
                    </a>
                  </td>
                  <td style="padding: 0 5px;">
                    <a href="${finalManageUrl}" style="background: #FFFFFF; color: #14B8A6; border: 2px solid #14B8A6; padding: 13px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                      ⚙️ Manage Booking
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SECTION 9: IMPORTANT INFORMATION -->
          <tr>
            <td style="padding: 0 30px 30px 30px; background-color: #FFFFFF;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFFBEB; border-left: 4px solid #FBBF24; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #92400E; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                      ⚠️ Important Information
                    </h3>
                    <ul style="color: #78350F; line-height: 1.8; padding-left: 20px; margin: 0; font-size: 14px;">
                      <li>Please reach the airport at least 2 hours before departure time</li>
                      <li>Carry a valid government-issued photo ID (Aadhar, Passport, etc.)</li>
                      <li>Web check-in opens 24 hours before departure</li>
                      <li>Boarding gates close 15 minutes before departure</li>
                      <li>Please review baggage restrictions before packing</li>
                      <li>For any changes, visit Manage Booking section</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SECTION 10: FOOTER -->
          <tr>
            <td style="background-color: #F9FAFB; border-top: 1px solid #CCFBF1; padding: 30px; text-align: center;">
              <p style="color: #134E4A; font-size: 16px; margin: 0 0 20px 0; font-weight: 500;">
                Thank you for choosing TLP Airways! ✈️
              </p>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 15px 0; line-height: 1.6;">
                Need help? Contact us at:<br>
                📧 support@tlpairways.com | 📞 1800-123-4567
              </p>
              <div style="margin: 20px 0;">
                <a href="https://tlpairways.thelearningproject.in" style="color: #14B8A6; text-decoration: none; margin: 0 10px; font-size: 14px;">Visit Website</a>
                <span style="color: #CCFBF1; margin: 0 10px;">|</span>
                <a href="https://tlpairways.thelearningproject.in/help" style="color: #14B8A6; text-decoration: none; margin: 0 10px; font-size: 14px;">Help Center</a>
                <span style="color: #CCFBF1; margin: 0 10px;">|</span>
                <a href="https://tlpairways.thelearningproject.in/terms" style="color: #14B8A6; text-decoration: none; margin: 0 10px; font-size: 14px;">Terms & Conditions</a>
              </div>
              <p style="color: #9CA3AF; font-size: 12px; margin: 15px 0 0 0; line-height: 1.6;">
                This is an automated email. Please do not reply to this message.<br>
                Add support@tlpairways.com to your contacts to ensure delivery.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of booking confirmation email
 */
function generateBookingConfirmationEmailText(bookingData) {
  const {
    passengerName = 'Guest',
    bookingId = 'N/A',
    flightNumber = 'N/A',
    route = 'N/A',
    travelDate = 'N/A',
    departureTime = '10:30',
    arrivalTime = '12:45',
    totalPassengers = 1,
    totalAmount = 0,
    currency = 'INR'
  } = bookingData;

  const formattedDate = formatDate(travelDate);
  const routeDisplay = route !== 'N/A' ? route.replace('-', ' → ') : 'N/A';
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return `
Booking Confirmed - TLP Airways

Hi ${passengerName},

Your flight booking is confirmed! Here are your booking details:

BOOKING INFORMATION
- Booking ID: ${bookingId}
- Booked On: ${formatDate(new Date().toISOString())}
- Total Passengers: ${totalPassengers}

FLIGHT DETAILS
- Flight Number: ${flightNumber}
- Route: ${routeDisplay}
- Travel Date: ${formattedDate}
- Departure: ${departureTime}
- Arrival: ${arrivalTime}

PAYMENT
- Total Amount: ${formatCurrency(totalAmount)}
- Payment Status: Paid

View your booking: https://tlpairways.thelearningproject.in/my-bookings/${bookingId}

Thank you for choosing TLP Airways!

Visit Website: https://tlpairways.thelearningproject.in
Contact Support: support@tlpairways.com | 1800-123-4567

This is an automated confirmation email. Please do not reply to this message.
  `.trim();
}

module.exports = {
  generateBookingConfirmationEmail,
  generateBookingConfirmationEmailText
};
