import { create } from 'zustand';

const useBookingStore = create((set, get) => ({
  searchParams: null,
  selectedOutbound: null,
  selectedReturn: null,
  passengers: [],
  cabinClass: 'Economy',
  addons: {
    extraBaggage: false,
    mealPlan: false,
    seatSelection: false,
    travelInsurance: false,
    priorityBoarding: false,
  },
  promoCode: null,
  discount: 0,
  contactInfo: null,

  setSearchParams: (params) => set({ searchParams: params }),
  setSelectedOutbound: (flight) => set({ selectedOutbound: flight }),
  setSelectedReturn: (flight) => set({ selectedReturn: flight }),
  setPassengers: (passengers) => set({ passengers }),
  setCabinClass: (cabinClass) => set({ cabinClass }),
  setAddons: (addons) => set({ addons }),
  setPromo: (code, discount) => set({ promoCode: code, discount }),
  setContactInfo: (info) => set({ contactInfo: info }),

  getTotalPrice: () => {
    const { selectedOutbound, selectedReturn, cabinClass, passengers, addons, discount } = get();
    if (!selectedOutbound) return 0;

    const key = cabinClass.toLowerCase();
    const adultCount = passengers.filter(p => p.type !== 'Infant').length || 1;

    const flightPrice = (f) => (f.price[key].base + f.price[key].taxes) * adultCount;
    let total = flightPrice(selectedOutbound);
    if (selectedReturn) total += flightPrice(selectedReturn);

    if (addons.extraBaggage) total += 599 * adultCount;
    if (addons.mealPlan) total += 299 * adultCount;
    if (addons.seatSelection) total += 199 * adultCount;
    if (addons.travelInsurance) total += 499 * adultCount;
    if (addons.priorityBoarding) total += 199 * adultCount;

    return Math.max(0, total - discount);
  },

  reset: () => set({
    selectedOutbound: null, selectedReturn: null,
    passengers: [], addons: { extraBaggage: false, mealPlan: false, seatSelection: false, travelInsurance: false, priorityBoarding: false },
    promoCode: null, discount: 0, contactInfo: null
  })
}));

export default useBookingStore;
