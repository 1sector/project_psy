import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePaymentStore } from '../store/paymentStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { Check, CreditCard } from 'lucide-react';

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { subscription, payments, fetchSubscription, fetchPayments, createSubscription, cancelSubscription } = usePaymentStore();
  
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'professional'>('basic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchSubscription(user.id);
      fetchPayments(user.id);
    }
  }, [user, fetchSubscription, fetchPayments]);
  
   const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      features: [
        'Access to all free tests',
        'Basic result analysis',
        'Limited to 3 tests per month',
        'Email support'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      features: [
        'Access to all tests (free and premium)',
        'Detailed result analysis',
        'Unlimited tests',
        'Priority email support',
        'Export results as PDF'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 39.99,
      features: [
        'Everything in Premium',
        'Create custom tests',
        'Advanced analytics dashboard',
        'Phone support',
        'Personalized recommendations'
      ]
    }
  ];
  
  const handleSubscribe = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    
    try {
      // In a real app, you would integrate with a payment processor here
      // This is just a simulation
      const today = new Date();
      const endDate = new Date();
      endDate.setMonth(today.getMonth() + 1); // 1 month subscription
      
      await createSubscription({
        user_id: user.id,
        plan: selectedPlan,
        status: 'active',
        start_date: today.toISOString(),
        end_date: endDate.toISOString()
      });
      
      setShowPaymentForm(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating subscription:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      try {
        await cancelSubscription(subscription.id);
      } catch (error) {
        console.error('Error cancelling subscription:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="mt-1 text-gray-600">
          Choose the plan that works best for you.
        </p>
      </div>
      
      {/* Current Subscription */}
      {subscription && (
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Current Subscription</h2>
              <p className="text-gray-600">
                You are currently on the <span className="font-medium">{subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}</span> plan.
              </p>
              <p className="text-sm text-gray-500">
                Active until {new Date(subscription.end_date).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </Button>
          </div>
        </Card>
      )}
      
      {/* Plans */}
      {!showPaymentForm ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={`border-2 ${selectedPlan === plan.id ? 'border-indigo-500' : 'border-transparent'}`}>
              <div className="p-2">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="mt-1 text-3xl font-bold text-gray-900">${plan.price}<span className="text-base font-normal text-gray-500">/month</span></p>
                
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="ml-3 text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <Button
                    fullWidth
                    variant={selectedPlan === plan.id ? 'primary' : 'outline'}
                    onClick={() => {
                      setSelectedPlan(plan.id as 'basic' | 'premium' | 'professional');
                      if (subscription?.plan !== plan.id) {
                        setShowPaymentForm(true);
                      }
                    }}
                    disabled={subscription?.plan === plan.id}
                  >
                    {subscription?.plan === plan.id ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Card Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="4242 4242 4242 4242"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expiration Date
                </label>
                <input
                  type="text"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="MM / YY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CVC
                </label>
                <input
                  type="text"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="123"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name on Card
              </label>
              <input
                type="text"
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="John Doe"
              />
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                You will be charged
              </p>
              <p className="text-lg font-medium text-gray-900">
                ${plans.find(p => p.id === selectedPlan)?.price}/month
              </p>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowPaymentForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubscribe}
                isLoading={isProcessing}
              >
                Subscribe
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Payment History */}
      {payments.length > 0 && (
        <Card className="mt-6" title="Payment History">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Subscription;