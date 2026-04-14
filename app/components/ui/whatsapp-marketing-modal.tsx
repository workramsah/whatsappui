'use client';

import { useState, useEffect } from 'react';
import { X, MessageCircle, ExternalLink, Plus, Minus } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { WhatsAppMarketingService } from '@/lib/whatsapp-marketing';
import { toast } from 'react-toastify';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
}

interface Product {
  id: string;
  name: string;
  price?: number;
  unit?: string;
  description?: string;
}

interface SelectedProduct {
  product: Product;
  quantity: number;
}

interface WhatsAppMarketingModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  customers?: Customer[];
  mode: 'single' | 'bulk';
}

export function WhatsAppMarketingModal({
  isOpen,
  onClose,
  customer,
  customers = [],
  mode,
}: WhatsAppMarketingModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  const templates = WhatsAppMarketingService.getTemplates();
  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);
  // is open
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fetchProducts = async () => {
    try {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/products', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        const productsArray = data.products || data || [];
        setProducts(productsArray);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const addProduct = (product: Product) => {
    const existing = selectedProducts.find(
      (sp) => sp.product.id === product.id,
    );
    if (existing) {
      setSelectedProducts((prev) =>
        prev.map((sp) =>
          sp.product.id === product.id
            ? { ...sp, quantity: sp.quantity + 1 }
            : sp,
        ),
      );
    } else {
      setSelectedProducts((prev) => [...prev, { product, quantity: 1 }]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.filter((sp) => sp.product.id !== productId),
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }
    setSelectedProducts((prev) =>
      prev.map((sp) =>
        sp.product.id === productId ? { ...sp, quantity } : sp,
      ),
    );
  };

  const generateBuyNowLink = () => {
    if (selectedProducts.length === 0) return '';

    const items = selectedProducts
      .map(
        (sp) =>
          `${sp.product.name} - ${sp.quantity} ${sp.product.unit} @ ₹${sp.product.price || 0}`,
      )
      .join('\n');

    const total = selectedProducts.reduce(
      (sum, sp) => sum + (sp.product.price || 0) * sp.quantity,
      0,
    );

    const orderData = {
      customerId: customer?.id,
      customerName: customer?.name,
      items: selectedProducts.map((sp) => ({
        productId: sp.product.id,
        name: sp.product.name,
        quantity: sp.quantity,
        price: sp.product.price,
        unit: sp.product.unit,
      })),
      total,
    };

    const encodedData = encodeURIComponent(JSON.stringify(orderData));
    return `${window.location.origin}/order-input/preview?data=${encodedData}`;
  };

  const handleSendMessage = async () => {
    if (mode === 'single' && customer) {
      if (!customer.phone) {
        toast.error('Customer has no phone number');
        return;
      }

      let message = useCustomMessage
        ? customMessage.replace('{name}', customer.name)
        : WhatsAppMarketingService.createPersonalizedMessage(
            customer,
            selectedTemplate,
            variables,
          );

      if (!message.trim()) {
        toast.error('Please enter a message');
        return;
      }

      // Add products to message if selected
      if (selectedProducts.length > 0) {
        const productList = selectedProducts
          .map((sp) => `🛍️ ${sp.product.name}`)
          .join('\n');

        const buyNowLink = generateBuyNowLink();
        message += `\n\n📋 *Products:*\n${productList}\n\n🛒 *Buy Now:* ${buyNowLink}`;
      }

      WhatsAppMarketingService.sendClickToChat(customer.phone, message);
      toast.success(`WhatsApp opened for ${customer.name}`);
      onClose();
    } else if (mode === 'bulk' && customers.length > 0) {
      const validCustomers = customers.filter((c) => c.phone);

      if (validCustomers.length === 0) {
        toast.error('No customers with phone numbers selected');
        return;
      }

      if (!selectedTemplate && !useCustomMessage) {
        toast.error('Please select a template or enter a custom message');
        return;
      }

      setLoading(true);

      try {
        const messages = validCustomers.map((c) => {
          let message = useCustomMessage
            ? customMessage.replace('{name}', c.name)
            : WhatsAppMarketingService.createPersonalizedMessage(
                c,
                selectedTemplate,
                variables,
              );

          return {
            phone: c.phone!,
            message,
            name: c.name,
          };
        });

        const response = await fetch('/api/whatsapp/bulk-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        });

        const result = await response.json();

        if (response.ok) {
          toast.success(`✅ Sent ${result.success} messages successfully!`);
          if (result.failed > 0) {
            toast.warning(`⚠️ ${result.failed} messages failed to send`);
            console.log(
              'Failed messages:',
              result.results?.filter((r: any) => r.status === 'failed'),
            );
          }
        } else {
          toast.error(`❌ Bulk send failed: ${result.error}`);
          console.error('Bulk send error:', result);
        }

        onClose();
      } catch (error) {
        toast.error('❌ Failed to send bulk messages');
        console.error('Bulk send error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const previewMessage = () => {
    if (!customer) return '';

    let message = '';
    if (useCustomMessage) {
      message = customMessage.replace('{name}', customer.name);
    } else if (selectedTemplateData) {
      message = WhatsAppMarketingService.createPersonalizedMessage(
        customer,
        selectedTemplate,
        variables,
      );
    }

    if (selectedProducts.length > 0) {
      const productList = selectedProducts
        .map((sp) => `🛍️ ${sp.product.name}`)
        .join('\n');
      message += `\n\n📋 *Products:*\n${productList}\n\n🛒 *Buy Now:* [Link will be generated]`;
    }

    return message;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold">
              {mode === 'single'
                ? 'Send WhatsApp Message'
                : `Bulk WhatsApp (${customers.length} customers)`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {mode === 'bulk' && customers.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Sending to {customers.filter((c) => c.phone).length} customers
                with phone numbers
              </p>
              <div className="text-xs text-blue-600 mt-1">
                {customers
                  .slice(0, 3)
                  .map((c) => c.name)
                  .join(', ')}
                {customers.length > 3 && ` and ${customers.length - 3} more...`}
              </div>
            </div>
          )}

          {customer && mode === 'single' && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium">{customer.name}</p>
              <p className="text-xs text-gray-600">
                {customer.phone || 'No phone number'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="template"
                checked={!useCustomMessage}
                onChange={() => setUseCustomMessage(false)}
              />
              <label htmlFor="template" className="text-sm font-medium">
                Use Template
              </label>
            </div>

            {!useCustomMessage && (
              <div className="space-y-3 ml-6">
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>

                {selectedTemplateData?.variables && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">Fill in variables:</p>
                    {selectedTemplateData.variables
                      .filter((v) => v !== 'name')
                      .map((variable) => (
                        <Input
                          key={variable}
                          placeholder={`Enter ${variable}`}
                          value={variables[variable] || ''}
                          onChange={(e) =>
                            setVariables((prev) => ({
                              ...prev,
                              [variable]: e.target.value,
                            }))
                          }
                          className="text-sm"
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="custom"
                checked={useCustomMessage}
                onChange={() => setUseCustomMessage(true)}
              />
              <label htmlFor="custom" className="text-sm font-medium">
                Custom Message
              </label>
            </div>

            {useCustomMessage && (
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your custom message. Use {name} for customer name."
                className="w-full p-3 border rounded-md text-sm h-24 resize-none ml-6"
              />
            )}
          </div>

          {/* Product Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Add Products (Optional)</h3>

            <select
              value={
                selectedProducts.length > 0
                  ? selectedProducts[0].product.id
                  : ''
              }
              onChange={(e) => {
                if (e.target.value) {
                  const product = products.find((p) => p.id === e.target.value);
                  if (product) {
                    addProduct({
                      ...product,
                      price: product.price || 0,
                      unit: product.unit || 'pcs',
                    });
                  }
                }
              }}
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            {/* Selected Products */}
            {selectedProducts.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                <p className="text-xs text-blue-700 font-medium">
                  Selected Products:
                </p>
                {selectedProducts.map((sp) => (
                  <div
                    key={sp.product.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium">{sp.product.name}</p>
                      <p className="text-xs text-gray-600">
                        {sp.product.description || 'No description'}
                      </p>
                    </div>
                    <button
                      onClick={() => removeProduct(sp.product.id)}
                      className="text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          {(selectedTemplate || useCustomMessage) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-700 font-medium mb-2">
                Preview:
              </p>
              <pre className="text-sm text-green-800 whitespace-pre-wrap">
                {previewMessage()}
              </pre>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={(!selectedTemplate && !useCustomMessage) || loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {loading
                ? 'Sending...'
                : mode === 'bulk'
                  ? `Send to ${customers.filter((c) => c.phone).length} customers`
                  : 'Open WhatsApp'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
