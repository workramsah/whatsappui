'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/api';
import { X, Search, Plus, User } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface CustomerSelectionModalProps {
  onSelect: (customerId: string | null) => void;
  onClose: () => void;
}

export function CustomerSelectionModal({
  onSelect,
  onClose,
}: CustomerSelectionModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Customer[]>('/customers');
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
    );
  }, [customers, searchQuery]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const newCustomer = await apiRequest<Customer>('/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
        }),
      });

      await loadCustomers();
      setShowCreateForm(false);
      setFormData({ name: '', email: '', phone: '', address: '' });
      onSelect(newCustomer.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create customer'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSelectCustomer = (customerId: string | null) => {
    onSelect(customerId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Select Customer
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Choose a customer or create a new one
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!showCreateForm ? (
            <>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full h-11 text-base border-dashed border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Customer
                </Button>

                <Button
                  variant="ghost"
                  className="w-full h-11 text-base text-slate-600 hover:bg-slate-100"
                  onClick={() => handleSelectCustomer(null)}
                >
                  <User className="h-4 w-4 mr-2" />
                  No Customer (Continue without customer)
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-slate-500">
                  Loading customers...
                </div>
              ) : error ? (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {searchQuery
                    ? 'No customers found matching your search'
                    : 'No customers yet. Create one to get started.'}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Existing Customers
                  </p>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleSelectCustomer(customer.id)}
                        className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="font-medium text-slate-900">
                          {customer.name}
                        </div>
                        {customer.email && (
                          <div className="text-sm text-slate-600">
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="text-sm text-slate-600">
                            {customer.phone}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Create New Customer
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ name: '', email: '', phone: '', address: '' });
                    setError(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-11 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Customer name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-11 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="customer@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                  Phone
                </Label>
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="NP"
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value || '' })}
                  className="[&>input]:h-11 [&>input]:px-3 [&>input]:py-2 [&>input]:border [&>input]:border-slate-300 [&>input]:rounded-md [&>input]:bg-background [&>input]:text-base [&>input]:focus:border-blue-500 [&>input]:focus:ring-blue-500 [&>.PhoneInputCountrySelect]:px-2 [&>.PhoneInputCountrySelect]:py-2 [&>.PhoneInputCountrySelect]:border [&>.PhoneInputCountrySelect]:border-slate-300 [&>.PhoneInputCountrySelect]:rounded-l-md [&>.PhoneInputCountrySelect]:bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-slate-700">
                  Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="h-11 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Customer address"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 text-base"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ name: '', email: '', phone: '', address: '' });
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="flex-1 h-11 text-base bg-blue-600 hover:bg-blue-700 rounded-full font-semibold"
                >
                  {creating ? 'Creating...' : 'Create & Select'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

