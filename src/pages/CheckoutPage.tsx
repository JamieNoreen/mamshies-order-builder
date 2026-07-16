import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { PrimaryButton } from '../components/shared/PrimaryButton';
import { 
  Sparkles, Upload, Trash2, Check, ArrowLeft, ArrowRight, CreditCard, Loader2
} from 'lucide-react';
import { cn } from '../utils/cn';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

interface FormDetails {
  fullName: string;
  phoneNumber: string;
  email: string;
  eventDate: string;
  deliveryTime: string;
  deliveryOption: 'pickup' | 'delivery';
  addressSearch: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  guestCount: string;
  additionalRequests: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

interface PaymentDetails {
  option: '50' | '100';
  referenceNumber: string;
  proofFile: File | null;
  proofPreviewUrl: string;
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clearCart);

  // Steps state: 1: Details, 2: Payment, 3: Review, 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Step 1 states
  const [details, setDetails] = useState<FormDetails>({
    fullName: '',
    phoneNumber: '',
    email: '',
    eventDate: '',
    deliveryTime: '',
    deliveryOption: 'delivery',
    addressSearch: '',
    streetAddress: '',
    city: '',
    province: '',
    postalCode: '',
    guestCount: '',
    additionalRequests: '',
    latitude: undefined,
    longitude: undefined,
    placeId: '',
  });

  const [step1Errors, setStep1Errors] = useState<Partial<Record<keyof FormDetails, string>>>({});

  // Google Maps state handlers
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Map Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  // Dynamic API script loader
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      const handleLoad = () => setMapsLoaded(true);
      existingScript.addEventListener('load', handleLoad);
      return () => existingScript.removeEventListener('load', handleLoad);
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      console.warn('Google Maps API Key placeholder detected or missing. Autocomplete will be unavailable.');
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => setMapsLoaded(true));
    script.addEventListener('error', () => console.error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  }, []);

  // Initialize mapCenter to Manila once maps API loads
  useEffect(() => {
    if (mapsLoaded && !mapCenter) {
      setMapCenter({ lat: 14.599512, lng: 120.984222 });
    }
  }, [mapsLoaded, mapCenter]);



  // Draggable Map Component initializer/updater
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || !mapCenter) return;

    if (!mapInstanceRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapInstanceRef.current = map;

      const marker = new window.google.maps.Marker({
        position: mapCenter,
        map: map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });
      markerInstanceRef.current = marker;

      marker.addListener('dragend', () => {
        const newPos = marker.getPosition();
        if (newPos) {
          const lat = newPos.lat();
          const lng = newPos.lng();
          handleReverseGeocode(lat, lng);
        }
      });
    } else {
      mapInstanceRef.current.setCenter(mapCenter);
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setPosition(mapCenter);
      }
    }
  }, [mapCenter, mapsLoaded]);

  // Form Step 2 states
  const [payment, setPayment] = useState<PaymentDetails>({
    option: '50',
    referenceNumber: '',
    proofFile: null,
    proofPreviewUrl: '',
  });

  const [step2Errors, setStep2Errors] = useState<{
    referenceNumber?: string;
    proofFile?: string;
  }>({});

  // Booking Reference state
  const [bookingRef, setBookingRef] = useState('');

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
    if (step1Errors[name as keyof FormDetails]) {
      setStep1Errors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Reverse Geocoding parser
  const handleReverseGeocode = (lat: number, lng: number) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
        const result = results[0];
        parseAndPopulateAddress(result, lat, lng);
      }
    });
  };

  // Shared Address parser & state populations
  const parseAndPopulateAddress = (geocodeResult: any, lat: number, lng: number) => {
    let streetNumber = '';
    let route = '';
    let city = '';
    let province = '';
    let postalCode = '';

    geocodeResult.address_components.forEach((comp: any) => {
      const types = comp.types;
      if (types.includes('street_number')) streetNumber = comp.long_name;
      if (types.includes('route')) route = comp.long_name;
      if (types.includes('locality') || types.includes('administrative_area_level_3') || types.includes('sublocality')) {
        city = comp.long_name;
      }
      if (types.includes('administrative_area_level_1') || types.includes('administrative_area_level_2')) {
        province = comp.long_name;
      }
      if (types.includes('postal_code')) postalCode = comp.long_name;
    });

    const streetAddress = [streetNumber, route].filter(Boolean).join(' ') || geocodeResult.formatted_address.split(',')[0];

    setDetails(prev => ({
      ...prev,
      addressSearch: geocodeResult.formatted_address,
      streetAddress: streetAddress,
      city: city || prev.city,
      province: province || prev.province,
      postalCode: postalCode || prev.postalCode,
      latitude: lat,
      longitude: lng,
      placeId: geocodeResult.place_id
    }));
    setMapCenter({ lat, lng });

    // Clear validation warnings
    setStep1Errors(prev => ({
      ...prev,
      addressSearch: undefined,
      streetAddress: undefined,
      city: undefined,
      province: undefined,
      postalCode: undefined
    }));
  };

  // Geolocation trigger
  const handleUseCurrentLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationLoading(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        handleReverseGeocode(lat, lng);
      },
      (error) => {
        setLocationLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please enter address details manually.');
        } else {
          setLocationError('Unable to retrieve location. Please enter address details manually.');
        }
      }
    );
  };



  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<Record<keyof FormDetails, string>> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!details.fullName.trim()) errors.fullName = 'Full name is required';
    
    // Validate phone
    const phonePattern = /^(09|\+639)\d{9}$/;
    const normalizedPhone = details.phoneNumber.replace(/\s+/g, '');
    if (!details.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!phonePattern.test(normalizedPhone) && normalizedPhone.length < 7) {
      errors.phoneNumber = 'Enter a valid phone number (e.g. 09171234567)';
    }

    if (details.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(details.email)) {
        errors.email = 'Enter a valid email address';
      }
    }

    if (!details.eventDate) {
      errors.eventDate = 'Event date is required';
    } else {
      const selectedDate = new Date(details.eventDate);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.eventDate = 'Event date must be today or in the future';
      }
    }

    if (!details.deliveryTime) {
      errors.deliveryTime = 'Delivery time is required';
    }

    if (details.deliveryOption === 'delivery') {
      if (!details.streetAddress.trim()) errors.streetAddress = 'Street address is required';
      if (!details.city.trim()) errors.city = 'City is required';
      if (!details.province.trim()) errors.province = 'Province is required';
      if (!details.postalCode.trim()) errors.postalCode = 'Postal code is required';
    }



    if (Object.keys(errors).length > 0) {
      setStep1Errors(errors);
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setStep(2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith('image/')) {
        setStep2Errors((prev) => ({ ...prev, proofFile: 'Please upload an image file (PNG, JPG, WebP)' }));
        return;
      }
      setPayment((prev) => ({
        ...prev,
        proofFile: file,
        proofPreviewUrl: URL.createObjectURL(file),
      }));
      setStep2Errors((prev) => ({ ...prev, proofFile: undefined }));
    }
  };

  const handleRemoveFile = () => {
    if (payment.proofPreviewUrl) {
      URL.revokeObjectURL(payment.proofPreviewUrl);
    }
    setPayment((prev) => ({
      ...prev,
      proofFile: null,
      proofPreviewUrl: '',
    }));
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { proofFile?: string } = {};

    if (!payment.proofFile) {
      errors.proofFile = 'Proof of payment screenshot is required';
    }

    if (Object.keys(errors).length > 0) {
      setStep2Errors(errors);
      return;
    }

    setStep(3);
  };

  const handleConfirmOrder = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const refCode = `MMS-${dateStr}-${rand}`;
    
    // Log compiled GHL integration payload
    const orderData = {
      referenceCode: refCode,
      clientDetails: details,
      paymentDetails: payment,
      items: items,
      subtotal: subtotal,
      reservationFee: subtotal * (payment.option === '50' ? 0.5 : 1),
      remainingBalance: subtotal - (subtotal * (payment.option === '50' ? 0.5 : 1)),
      timestamp: new Date().toISOString()
    };
    console.log('Fulfillment Order Data (Ready for GoHighLevel):', orderData);

    setBookingRef(refCode);
    setStep(4);
  };

  // Calculations
  const feePercent = payment.option === '50' ? 0.5 : 1;
  const reservationFee = subtotal * feePercent;
  const remainingBalance = subtotal - reservationFee;

  // Empty cart fallback
  if (items.length === 0 && step !== 4) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 select-none">
        <div className="bg-white/80 p-8 rounded-2xl border border-secondary/15 max-w-md w-full text-center shadow-md flex flex-col items-center gap-4">
          <div className="bg-primary/10 text-primary p-4 rounded-full">
            <Sparkles className="w-10 h-10" />
          </div>
          <h3 className="font-fraunces font-bold text-2xl text-text-charcoal">Your cart is empty</h3>
          <p className="font-manrope text-sm text-secondary/60">
            Please add catering products or custom platters to your cart before proceeding to checkout.
          </p>
          <PrimaryButton
            variant="primary"
            onClick={() => navigate('/')}
            className="w-full mt-2 h-11 text-sm font-bold flex items-center justify-center gap-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Our Menu</span>
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-text-charcoal pb-20 select-none">
      {/* Checkout Navbar */}
      <header className="border-b border-secondary/10 bg-white/70 backdrop-blur-md sticky top-0 z-30 select-none">
        <div 
          className="mx-auto px-8 h-16 flex items-center justify-between w-full"
          style={{ maxWidth: '960px' }}
        >
          <button
            onClick={() => step === 4 ? handleConfirmOrder() : navigate('/')}
            className="flex items-center gap-2 font-manrope font-bold text-sm text-primary hover:text-primary/80 transition-colors active:scale-95 cursor-pointer"
            disabled={step === 4}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Menu</span>
          </button>
          
          {/* Compact Brand Section */}
          <div className="flex items-center gap-3 select-none">
            <img
              src="/Mamshies logo.png"
              alt="Mamshies Logo"
              className="h-11 w-auto object-contain flex-shrink-0"
            />
            <span className="font-fraunces font-bold text-base text-primary block whitespace-nowrap">
              Mamshies Meals
            </span>
          </div>
        </div>
      </header>

      {/* Form container: 30-40% screen width on desktop/tablet (500px), 100% on mobile */}
      <div 
        className="mx-auto w-full px-8 py-10"
        style={{ maxWidth: '500px' }}
      >
        
        {/* Wizard Progress Bar */}
        {step < 4 && (
          <div className="mb-10 w-full select-none">
            <div className="flex items-center justify-between relative px-2">
              {/* Connector Lines */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-secondary/10 z-0 mx-2" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-300 z-0 mx-2"
                style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
              />

              {/* Step 1 Bubble */}
              <div className="z-10 flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-manrope transition-all duration-300 border",
                  step >= 1 
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/20" 
                    : "bg-white border-secondary/20 text-secondary/40"
                )}>
                  {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <span className={cn(
                  "font-manrope text-[10px] font-bold tracking-wide uppercase",
                  step >= 1 ? "text-primary font-extrabold" : "text-secondary/40"
                )}>
                  Details
                </span>
              </div>

              {/* Step 2 Bubble */}
              <div className="z-10 flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-manrope transition-all duration-300 border",
                  step >= 2
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/20" 
                    : "bg-white border-secondary/20 text-secondary/40"
                )}>
                  {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <span className={cn(
                  "font-manrope text-[10px] font-bold tracking-wide uppercase",
                  step >= 2 ? "text-primary font-extrabold" : "text-secondary/40"
                )}>
                  Payment
                </span>
              </div>

              {/* Step 3 Bubble */}
              <div className="z-10 flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-manrope transition-all duration-300 border",
                  step >= 3
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/20" 
                    : "bg-white border-secondary/20 text-secondary/40"
                )}>
                  3
                </div>
                <span className={cn(
                  "font-manrope text-[10px] font-bold tracking-wide uppercase",
                  step >= 3 ? "text-primary font-extrabold" : "text-secondary/40"
                )}>
                  Review
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Form Panels */}
        <div className="w-full">
          
          {/* STEP 1: RESERVATION DETAILS */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="bg-white p-6 md:p-8 rounded-2xl border border-secondary/15 shadow-sm flex flex-col gap-6 w-full animate-in fade-in duration-200">
              
              <div className="pb-2 border-b border-secondary/5">
                <h3 className="font-fraunces font-bold text-xl text-text-charcoal">Order Request Form</h3>
              </div>

              {/* Single Column Vertical Stack */}
              <div className="flex flex-col gap-5 w-full">
                
                {/* Full Name */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="block text-sm font-semibold text-[#2D3748]">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={details.fullName}
                    onChange={handleDetailsChange}
                    placeholder="Enter your full name"
                    className={cn(
                      "w-full h-11 px-4 border border-[#E2E8F0] rounded-lg text-sm font-manrope text-text-charcoal focus:outline-none focus:border-primary transition-all",
                      step1Errors.fullName && "border-red-500 bg-red-50/10 focus:border-red-500"
                    )}
                  />
                  {step1Errors.fullName && <span className="text-[10px] text-red-500 font-bold mt-0.5">{step1Errors.fullName}</span>}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="block text-sm font-semibold text-[#2D3748]">Phone *</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={details.phoneNumber}
                    onChange={handleDetailsChange}
                    placeholder="+1 (555) 000-0000"
                    className={cn(
                      "w-full h-11 px-4 border border-[#E2E8F0] rounded-lg text-sm font-manrope text-text-charcoal focus:outline-none focus:border-primary transition-all",
                      step1Errors.phoneNumber && "border-red-500 bg-red-50/10 focus:border-red-500"
                    )}
                  />
                  {step1Errors.phoneNumber && <span className="text-[10px] text-red-500 font-bold mt-0.5">{step1Errors.phoneNumber}</span>}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="block text-sm font-semibold text-[#2D3748]">Email</label>
                  <input
                    type="text"
                    name="email"
                    value={details.email}
                    onChange={handleDetailsChange}
                    placeholder="your@email.com"
                    className={cn(
                      "w-full h-11 px-4 border border-[#E2E8F0] rounded-lg text-sm font-manrope text-text-charcoal focus:outline-none focus:border-primary transition-all",
                      step1Errors.email && "border-red-500 bg-red-50/10 focus:border-red-500"
                    )}
                  />
                  {step1Errors.email && <span className="text-[10px] text-red-500 font-bold mt-0.5">{step1Errors.email}</span>}
                </div>

                {/* Event Date */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="block text-sm font-semibold text-[#2D3748]">Delivery Date *</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={details.eventDate}
                    onChange={handleDetailsChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={cn(
                      "w-full h-11 px-4 border border-[#E2E8F0] rounded-lg text-sm font-manrope text-[#2D3748] focus:outline-none focus:border-primary transition-all",
                      step1Errors.eventDate && "border-red-500 bg-red-50/10 focus:border-red-500"
                    )}
                  />
                  {step1Errors.eventDate && <span className="text-[10px] text-red-500 font-bold mt-0.5">{step1Errors.eventDate}</span>}
                </div>

                {/* Preferred Delivery Time */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="block text-sm font-semibold text-[#2D3748]">Preferred Delivery Time *</label>
                  <select
                    name="deliveryTime"
                    value={details.deliveryTime}
                    onChange={handleDetailsChange}
                    className={cn(
                      "w-full h-11 px-4 border border-[#E2E8F0] rounded-lg text-sm font-manrope text-[#2D3748] focus:outline-none focus:border-primary transition-all cursor-pointer bg-white",
                      step1Errors.deliveryTime && "border-red-500 bg-red-50/10 focus:border-red-500"
                    )}
                  >
                    <option value="">Select an option</option>
                    <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM</option>
                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                    <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                    <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                    <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                    <option value="07:00 PM - 08:00 PM">07:00 PM - 08:00 PM</option>
                  </select>
                  {step1Errors.deliveryTime && <span className="text-[10px] text-red-500 font-bold mt-0.5">{step1Errors.deliveryTime}</span>}
                </div>

                {/* Fulfillment Method */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="block text-sm font-semibold text-[#2D3748]">Fulfillment Method *</label>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <label className={cn(
                      "h-11 rounded-lg border flex items-center justify-center gap-2 cursor-pointer font-manrope text-sm font-bold transition-all",
                      details.deliveryOption === 'delivery' 
                        ? "bg-primary/5 border-primary text-primary" 
                        : "border-[#E2E8F0] bg-white text-secondary/65 hover:border-primary/20"
                    )}>
                      <input
                        type="radio"
                        name="deliveryOption"
                        value="delivery"
                        checked={details.deliveryOption === 'delivery'}
                        onChange={() => setDetails(prev => ({ ...prev, deliveryOption: 'delivery' }))}
                        className="sr-only"
                      />
                      <span>Delivery</span>
                    </label>

                    <label className={cn(
                      "h-11 rounded-lg border flex items-center justify-center gap-2 cursor-pointer font-manrope text-sm font-bold transition-all",
                      details.deliveryOption === 'pickup' 
                        ? "bg-primary/5 border-primary text-primary" 
                        : "border-[#E2E8F0] bg-white text-secondary/65 hover:border-primary/20"
                    )}>
                      <input
                        type="radio"
                        name="deliveryOption"
                        value="pickup"
                        checked={details.deliveryOption === 'pickup'}
                        onChange={() => setDetails(prev => ({ 
                          ...prev, 
                          deliveryOption: 'pickup', 
                          addressSearch: '', 
                          streetAddress: '', 
                          city: '', 
                          province: '', 
                          postalCode: '',
                          latitude: undefined,
                          longitude: undefined,
                          placeId: ''
                        }))}
                        className="sr-only"
                      />
                      <span>Store Pickup</span>
                    </label>
                  </div>
                </div>

                {/* Address Section (Visible if delivery is chosen) */}
                {details.deliveryOption === 'delivery' && (
                  <div className="flex flex-col gap-5 p-5 bg-secondary/[0.02] border border-[#E2E8F0] rounded-xl animate-in fade-in duration-200 w-full relative">
                    
                    {/* Geolocation Button */}
                    <div className="w-full">
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={locationLoading}
                        className="h-10 px-4 w-full rounded-lg border border-secondary/15 bg-white hover:bg-secondary/[0.02] flex items-center justify-center gap-2 font-manrope text-xs font-bold text-text-charcoal transition-all active:scale-98 cursor-pointer disabled:opacity-60"
                      >
                        {locationLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            <span>Locating...</span>
                          </>
                        ) : (
                          <>
                            <span>📍</span>
                            <span>Use Current Location</span>
                          </>
                        )}
                      </button>
                      {locationError && (
                        <span className="text-[10px] text-red-500 font-bold mt-1.5 block text-center">
                          {locationError}
                        </span>
                      )}
                    </div>
                    
                    {/* Street Address */}
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="block text-sm font-semibold text-[#2D3748]">Street Address</label>
                      <input
                        type="text"
                        name="streetAddress"
                        value={details.streetAddress}
                        onChange={handleDetailsChange}
                        placeholder="Enter street, building, or house number"
                        className={cn(
                          "w-full h-11 px-4 border border-[#E2E8F0] rounded-lg text-sm font-manrope text-text-charcoal focus:outline-none focus:border-primary transition-all",
                          step1Errors.streetAddress && "border-red-500 focus:border-red-500"
                        )}
                      />
                      {step1Errors.streetAddress && <span className="text-[10px] text-red-500 font-bold mt-0.5">{step1Errors.streetAddress}</span>}
                    </div>

                    {/* City */}
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="block text-sm font-semibold text-[#2D3748]">City</label>
                      <input
                        type="text"
                        name="city"
                        value={details.city}
                        onChange={handleDetailsChange}
                        placeholder="Enter city or municipality"
                        className={cn(
                          "w-full h-11 px-4 border border-[#E2E8F0] rounded-lg text-sm font-manrope text-text-charcoal focus:outline-none focus:border-primary transition-all",
                          step1Errors.city && "border-red-500 focus:border-red-500"
                        )}
                      />
                      {step1Errors.city && <span className="text-[10px] text-red-500 font-bold mt-0.5">{step1Errors.city}</span>}
                    </div>

                    {/* Province */}
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="block text-sm font-semibold text-[#2D3748]">Province</label>
                      <input
                        type="text"
                        name="province"
                        value={details.province}
                        onChange={handleDetailsChange}
                        placeholder="Enter province"
                        className={cn(
                          "w-full h-11 px-4 border border-[#E2E8F0] rounded-lg text-sm font-manrope text-text-charcoal focus:outline-none focus:border-primary transition-all",
                          step1Errors.province && "border-red-500 focus:border-red-500"
                        )}
                      />
                      {step1Errors.province && <span className="text-[10px] text-red-500 font-bold mt-0.5">{step1Errors.province}</span>}
                    </div>

                    {/* Postal Code */}
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="block text-sm font-semibold text-[#2D3748]">Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={details.postalCode}
                        onChange={handleDetailsChange}
                        placeholder="ZIP or postal code"
                        className={cn(
                          "w-full h-11 px-4 border border-[#E2E8F0] rounded-lg text-sm font-manrope text-text-charcoal focus:outline-none focus:border-primary transition-all",
                          step1Errors.postalCode && "border-red-500 focus:border-red-500"
                        )}
                      />
                      {step1Errors.postalCode && <span className="text-[10px] text-red-500 font-bold mt-0.5">{step1Errors.postalCode}</span>}
                    </div>

                    {/* Draggable Mini Map Component */}
                    {mapCenter && mapsLoaded && (
                      <div className="w-full mt-1.5 flex flex-col gap-1">
                        <span className="text-[10.5px] font-bold text-secondary/50 uppercase tracking-wider block mb-1">
                          📍 Pin marker location (Draggable)
                        </span>
                        <div 
                          ref={mapRef} 
                          className="w-full h-60 rounded-xl border border-secondary/15 shadow-sm overflow-hidden" 
                        />
                      </div>
                    )}

                  </div>
                )}

                {/* Additional Requests */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="block text-sm font-semibold text-[#2D3748]">Additional Requests</label>
                  <textarea
                    name="additionalRequests"
                    value={details.additionalRequests}
                    onChange={handleDetailsChange}
                    placeholder="Dietary requests, allergies, preferred dishes, event theme, or other special instructions."
                    rows={4}
                    className="w-full p-4 border border-[#E2E8F0] rounded-lg text-sm font-manrope text-text-charcoal focus:outline-none focus:border-primary transition-all resize-none"
                  />
                </div>

              </div>

              {/* Step 1 Actions */}
              <div className="pt-4 border-t border-secondary/5 mt-2 flex justify-end">
                <PrimaryButton
                  type="submit"
                  variant="primary"
                  className="w-full h-11 text-sm font-bold flex items-center justify-center gap-1.5 rounded-lg active:scale-98 transition-all"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </PrimaryButton>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="bg-white p-6 md:p-8 rounded-2xl border border-secondary/15 shadow-sm flex flex-col gap-6 w-full animate-in fade-in duration-200">
              <div className="pb-2 border-b border-secondary/5">
                <h3 className="font-fraunces font-bold text-xl text-text-charcoal">Payment</h3>
              </div>

              {/* Payment Type Option */}
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-semibold text-[#2D3748]">Payment Type</label>
                <div className="grid grid-cols-1 gap-4 w-full">
                  <label className={cn(
                    "p-5 border rounded-xl flex flex-col gap-1 cursor-pointer transition-all",
                    payment.option === '50'
                      ? "bg-primary/5 border-primary text-primary"
                      : "border-[#E2E8F0] bg-white text-secondary/65 hover:border-primary/25"
                  )}>
                    <input
                      type="radio"
                      name="paymentOption"
                      value="50"
                      checked={payment.option === '50'}
                      onChange={() => setPayment(prev => ({ ...prev, option: '50' }))}
                      className="sr-only"
                    />
                    <span className="font-manrope font-bold text-sm text-text-charcoal">50% Reservation</span>
                    <span className="font-manrope text-[11px] text-secondary/50 font-semibold leading-relaxed">
                      Pay ₱{(subtotal * 0.5).toLocaleString()} today.
                    </span>
                  </label>

                  <label className={cn(
                    "p-5 border rounded-xl flex flex-col gap-1 cursor-pointer transition-all",
                    payment.option === '100'
                      ? "bg-primary/5 border-primary text-primary"
                      : "border-[#E2E8F0] bg-white text-secondary/65 hover:border-primary/25"
                  )}>
                    <input
                      type="radio"
                      name="paymentOption"
                      value="100"
                      checked={payment.option === '100'}
                      onChange={() => setPayment(prev => ({ ...prev, option: '100' }))}
                      className="sr-only"
                    />
                    <span className="font-manrope font-bold text-sm text-text-charcoal">100% Full Payment</span>
                    <span className="font-manrope text-[11px] text-secondary/50 font-semibold leading-relaxed">
                      Pay ₱{subtotal.toLocaleString()} today.
                    </span>
                  </label>
                </div>
              </div>

              {/* QR Code Placeholder Card */}
              <div className="w-full aspect-[4/3] max-w-sm mx-auto border border-[#E2E8F0] bg-secondary/[0.02] rounded-2xl flex flex-col items-center justify-center gap-1.5 select-none my-2">
                <CreditCard className="w-8 h-8 text-secondary/35" />
                <span className="font-manrope font-bold text-sm text-secondary/60">GCash QR Placeholder</span>
                <span className="font-manrope text-[10px] text-secondary/40 italic">Will be replaced with merchant QR code</span>
              </div>

              {/* Upload Proof of Payment */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-sm font-semibold text-[#2D3748]">Upload Proof of Payment</label>
                
                {payment.proofPreviewUrl ? (
                  /* Uploaded preview */
                  <div className="relative border border-[#E2E8F0] rounded-xl p-4 bg-background flex items-center justify-between gap-4 animate-in fade-in duration-200 w-full">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={payment.proofPreviewUrl}
                        alt="Proof screenshot"
                        className="w-16 h-16 rounded-lg object-cover border border-secondary/10 shrink-0"
                      />
                      <div className="flex flex-col select-none">
                        <span className="font-manrope font-bold text-xs text-text-charcoal truncate max-w-[150px]">
                          {payment.proofFile?.name}
                        </span>
                        <span className="font-manrope text-[10px] text-secondary/40 font-semibold mt-0.5">
                          {payment.proofFile ? `${(payment.proofFile.size / 1024).toFixed(1)} KB` : ''}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50 active:scale-90 cursor-pointer"
                      title="Remove screenshot"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ) : (
                  /* Drag and drop upload screenshot */
                  <label className={cn(
                    "w-full h-36 border-2 border-dashed border-[#CBD5E0] hover:border-primary/50 hover:bg-primary/[0.01] rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-150",
                    step2Errors.proofFile && "border-red-400 bg-red-50/5 focus:border-red-400"
                  )}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    <Upload className="w-5 h-5 text-secondary/45" />
                    <span className="font-manrope font-bold text-xs text-[#2D3748]">
                      Upload Screenshot
                    </span>
                    <span className="font-manrope text-[10px] text-secondary/40 font-semibold">
                      PNG, JPG, or WEBP up to 10MB
                    </span>
                  </label>
                )}
                {step2Errors.proofFile && <span className="text-[10px] text-red-500 font-bold mt-0.5">{step2Errors.proofFile}</span>}
              </div>



              {/* Step 2 Actions */}
              <div className="pt-4 border-t border-secondary/5 mt-2 flex flex-col gap-3">
                <PrimaryButton
                  type="submit"
                  variant="primary"
                  className="w-full h-11 text-sm font-bold flex items-center justify-center gap-1.5 rounded-lg active:scale-98 transition-all"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </PrimaryButton>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-11 w-full rounded-lg font-manrope text-sm font-bold border border-[#E2E8F0] text-text-charcoal hover:bg-surface transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Details</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER REVIEW */}
          {step === 3 && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-secondary/15 shadow-sm flex flex-col gap-6 w-full animate-in fade-in duration-200">
              <div className="pb-2 border-b border-secondary/5">
                <h3 className="font-fraunces font-bold text-xl text-text-charcoal">Review</h3>
              </div>

              <div className="flex flex-col gap-5 select-none w-full">
                
                {/* 1. Reservation Details Summary */}
                <div className="border border-secondary/10 rounded-xl p-5 bg-[#FAF7F2]/45 flex flex-col gap-3.5 text-xs font-manrope w-full">
                  <h4 className="font-fraunces font-bold text-sm text-primary uppercase tracking-wide">Reservation Details</h4>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-secondary/40 font-bold uppercase tracking-wider">Client Name</span>
                      <span className="font-bold text-text-charcoal">{details.fullName}</span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-secondary/40 font-bold uppercase tracking-wider">Phone Number</span>
                      <span className="font-bold text-text-charcoal">{details.phoneNumber}</span>
                    </div>

                    {details.email && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-secondary/40 font-bold uppercase tracking-wider">Email</span>
                        <span className="font-bold text-text-charcoal">{details.email}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-secondary/40 font-bold uppercase tracking-wider">Delivery Schedule</span>
                      <span className="font-bold text-text-charcoal">
                        {new Date(details.eventDate).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })} — {details.deliveryTime}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-secondary/40 font-bold uppercase tracking-wider">Fulfillment Method</span>
                      <span className="font-bold text-text-charcoal capitalize">
                        {details.deliveryOption === 'delivery' 
                          ? `Delivery (Address: ${details.streetAddress}, ${details.city}, ${details.province}, ${details.postalCode})` 
                          : 'Store Pickup'}
                      </span>
                    </div>


                  </div>

                  {details.additionalRequests.trim() && (
                    <div className="border-t border-secondary/10 pt-2.5 mt-1 flex flex-col gap-0.5">
                      <span className="text-[10px] text-secondary/40 font-bold uppercase tracking-wider">Additional Requests</span>
                      <span className="text-secondary/75 italic">"{details.additionalRequests}"</span>
                    </div>
                  )}
                </div>

                {/* 2. Invoice Details */}
                <div className="border border-secondary/10 rounded-xl overflow-hidden w-full">
                  <div className="bg-secondary/5 px-4.5 py-3 border-b border-secondary/10 flex items-center">
                    <h4 className="font-fraunces font-bold text-sm text-text-charcoal uppercase tracking-wide">Order Summary</h4>
                  </div>
                  <div className="divide-y divide-secondary/5 bg-white">
                    {items.map((item, idx) => (
                      <div key={idx} className="p-4.5 flex justify-between items-start gap-4 text-xs font-manrope">
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-bold text-text-charcoal truncate">{item.product.title}</span>
                          <span className="text-[10px] text-secondary/50 font-semibold mt-0.5">
                            Size: {item.selectedSize} × {item.quantity}
                          </span>
                        </div>
                        <span className="font-bold text-text-charcoal shrink-0">₱{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Totals Billing info */}
                <div className="border border-secondary/15 rounded-xl p-5 bg-[#FAF7F2]/45 flex flex-col gap-3 font-manrope text-xs text-secondary/55 w-full">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="font-bold text-text-charcoal">₱{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-secondary/5 pt-2.5">
                    <span>Payment Selected</span>
                    <span className="font-bold text-text-charcoal">{payment.option === '50' ? '50% Reservation Fee' : '100% Full Payment'}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-bold text-[#2D3748] border-t border-secondary/5 pt-2.5">
                    <span>Reservation Fee Paid Today</span>
                    <span className="text-base font-bold text-primary">₱{reservationFee.toLocaleString()}</span>
                  </div>

                  {payment.option === '50' && (
                    <div className="flex justify-between items-center text-[11px] font-semibold text-secondary/45 border-t border-secondary/5 pt-2.5">
                      <span>Remaining Balance (Due on event day)</span>
                      <span>₱{remainingBalance.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm font-black text-text-charcoal border-t border-secondary/10 pt-3">
                    <span>Grand Total</span>
                    <span className="text-lg font-black text-primary">₱{subtotal.toLocaleString()}</span>
                  </div>
                </div>

              </div>

              {/* Step 3 Actions */}
              <div className="pt-4 border-t border-secondary/5 mt-2 flex flex-col gap-3">
                <PrimaryButton
                  type="button"
                  variant="primary"
                  onClick={handleConfirmOrder}
                  className="w-full h-11 text-sm font-bold flex items-center justify-center gap-1.5 rounded-lg shadow-md hover:shadow-lg active:scale-98 transition-all bg-green-700 hover:bg-green-800"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Place Order</span>
                </PrimaryButton>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-11 w-full rounded-lg font-manrope text-sm font-bold border border-[#E2E8F0] text-text-charcoal hover:bg-surface transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Payment</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUBMIT SUCCESS PAGE */}
          {step === 4 && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E2E8F0] shadow-md flex flex-col items-center text-center gap-6 select-none animate-in zoom-in-95 duration-200 w-full">
              
              <div className="bg-green-100 text-green-600 p-4.5 rounded-full animate-bounce mt-4">
                <Check className="w-12 h-12 stroke-[3]" />
              </div>

              <div className="flex flex-col gap-1.5 max-w-md">
                <h3 className="font-fraunces font-bold text-2xl text-text-charcoal leading-none">Booking Submitted Successfully!</h3>
                <p className="font-manrope text-xs text-secondary/65 leading-relaxed mt-1">
                  Thank you for choosing Mamshies! We have received your payment reference. Our team will verify your reservation and contact you shortly.
                </p>
              </div>

              {/* Success Card Details Summary */}
              <div className="w-full bg-[#FAF7F2]/45 border border-[#E2E8F0] rounded-xl p-5 text-left flex flex-col gap-3 text-xs font-manrope">
                <div className="flex justify-between items-center pb-2 border-b border-secondary/10">
                  <span className="text-[10px] text-secondary/40 font-bold uppercase tracking-wider">Booking Reference</span>
                  <span className="font-fraunces font-black text-primary text-sm tracking-wide">{bookingRef}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-secondary/50 font-semibold">Client Name</span>
                  <span className="font-bold text-text-charcoal">{details.fullName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-secondary/50 font-semibold">Event Date</span>
                  <span className="font-bold text-text-charcoal">
                    {new Date(details.eventDate).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-secondary/50 font-semibold">Fulfillment</span>
                  <span className="font-bold text-text-charcoal capitalize">{details.deliveryOption}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-secondary/50 font-semibold">Payment Terms</span>
                  <span className="font-bold text-text-charcoal">
                    {payment.option === '50' ? '50% Reservation paid' : '100% Full Payment paid'}
                  </span>
                </div>



                {details.latitude && details.longitude && (
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-secondary/5">
                    <span className="text-[9px] text-secondary/40 font-bold uppercase tracking-wider">Map Coordinates</span>
                    <span className="font-mono text-[10px] text-secondary/65">
                      Lat: {details.latitude.toFixed(6)}, Lng: {details.longitude.toFixed(6)}
                    </span>
                  </div>
                )}

                <div className="h-px bg-secondary/10 my-0.5" />

                <div className="flex justify-between items-center text-sm font-bold text-text-charcoal">
                  <span>Paid Today</span>
                  <span className="text-base font-black text-primary">₱{reservationFee.toLocaleString()}</span>
                </div>

                {payment.option === '50' && (
                  <div className="flex justify-between items-center text-[10px] font-bold text-secondary/40 uppercase tracking-wider">
                    <span>Remaining Balance (Due on event day)</span>
                    <span>₱{remainingBalance.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Final Back to Menu button */}
              <div className="w-full pt-2">
                <PrimaryButton
                  variant="primary"
                  onClick={() => {
                    clearCart();
                    navigate('/');
                  }}
                  className="w-full h-11 text-sm font-bold flex items-center justify-center gap-2 rounded-lg"
                >
                  <span>Clear Cart & Return Home</span>
                </PrimaryButton>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
