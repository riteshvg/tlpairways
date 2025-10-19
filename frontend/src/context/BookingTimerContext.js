import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingTimerContext = createContext();

export const useBookingTimer = () => {
  const context = useContext(BookingTimerContext);
  if (!context) {
    throw new Error('useBookingTimer must be used within a BookingTimerProvider');
  }
  return context;
};

export const BookingTimerProvider = ({ children }) => {
  const [bookingStartTime, setBookingStartTime] = useState(null);
  const [bookingEndTime, setBookingEndTime] = useState(null);
  const [bookingDuration, setBookingDuration] = useState(null);

  // Start the booking timer
  const startBookingTimer = () => {
    const startTime = new Date();
    setBookingStartTime(startTime);
    // Store in sessionStorage to persist across page refreshes
    sessionStorage.setItem('bookingStartTime', startTime.toISOString());
  };

  // End the booking timer
  const endBookingTimer = () => {
    if (bookingStartTime) {
      const endTime = new Date();
      setBookingEndTime(endTime);
      const duration = endTime - bookingStartTime;
      setBookingDuration(duration);
      // Store in sessionStorage
      sessionStorage.setItem('bookingEndTime', endTime.toISOString());
      sessionStorage.setItem('bookingDuration', duration.toString());
    }
  };

  // Clear the booking timer
  const clearBookingTimer = () => {
    setBookingStartTime(null);
    setBookingEndTime(null);
    setBookingDuration(null);
    sessionStorage.removeItem('bookingStartTime');
    sessionStorage.removeItem('bookingEndTime');
    sessionStorage.removeItem('bookingDuration');
  };

  // Restore booking timer from sessionStorage on mount
  useEffect(() => {
    const storedStartTime = sessionStorage.getItem('bookingStartTime');
    const storedEndTime = sessionStorage.getItem('bookingEndTime');
    const storedDuration = sessionStorage.getItem('bookingDuration');

    if (storedStartTime) {
      setBookingStartTime(new Date(storedStartTime));
    }
    if (storedEndTime) {
      setBookingEndTime(new Date(storedEndTime));
    }
    if (storedDuration) {
      setBookingDuration(parseInt(storedDuration));
    }
  }, []);

  const value = {
    bookingStartTime,
    bookingEndTime,
    bookingDuration,
    startBookingTimer,
    endBookingTimer,
    clearBookingTimer
  };

  return (
    <BookingTimerContext.Provider value={value}>
      {children}
    </BookingTimerContext.Provider>
  );
};

