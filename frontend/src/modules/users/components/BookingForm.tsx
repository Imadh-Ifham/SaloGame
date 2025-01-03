import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { API_ENDPOINTS } from '../../../api/endpoints';
import axios from 'axios';

const createBooking = async (data: BookingFormData) => {
  return axios.post(API_ENDPOINTS.BOOKINGS.CREATE_BOOKING, data);
};

export interface BookingFormData {
  id?: string;
  date: string | Date;
  time: string;
  name: string;
  phone: string;
  email: string;
}

interface BookingFormProps {
  initialData?: BookingFormData;
  onSave?: (data: BookingFormData) => Promise<void>;
  onCancel?: () => void;
}

const BookingForm = ({ initialData, onSave, onCancel }: BookingFormProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<BookingFormData>({
    defaultValues: initialData ? {
      ...initialData,
      date: initialData.date ? new Date(initialData.date) : new Date(),
      phone: initialData.phone?.toString() || ''
    } : {
      date: new Date(),
      time: '',
      name: '',
      phone: '',
      email: ''
    }
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      setIsSubmitting(true);
      const response = await createBooking(data);
      setIsSubmitting(false);
      if (response.status === 201) {
        alert('Booking created successfully!');
        reset();
        setStep(1);
      } else {
        alert(`Failed to create booking: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create booking';
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg">
      <div className="mb-8">
       
        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded-full ${step === 1 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`w-4 h-4 rounded-full ${step === 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
        </div>
      </div>
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Date</label>
            <Controller
              name="date"
              control={control}
              rules={{ required: 'Date is required' }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value instanceof Date ? field.value : new Date(field.value)}
                  onChange={(date: Date | null) => field.onChange(date)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  minDate={new Date()}
                />
              )}
            />
            {errors.date && <span className="text-red-500 text-sm">{errors.date.message}</span>}
          </div>

          <div>
            <label className="block mb-2">Time</label>
            <input
              type="time"
              {...register('time', { required: 'Time is required' })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            {errors.time && <span className="text-red-500 text-sm">{errors.time.message}</span>}
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block mb-2 flex items-center">
              <div className="mr-2 text-blue-500" />
              Name
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block mb-2">Phone</label>
            <input
              type="tel"
              {...register('phone', { 
                required: 'Phone is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Invalid phone number'
                }
              })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
          </div>

          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-all duration-200 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default BookingForm;
