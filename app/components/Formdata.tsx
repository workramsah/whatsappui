'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Checkbox } from '@/app/components/ui/checkbox'
import { MessageCircle,  Mail, Send } from 'lucide-react'

export default function Formdata () {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    country: '',
    companySize: '',
    overview: '',
    refundPolicy: false,
    privacyPolicy: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <div className="min-h-min  p-3 flex items-center justify-center">
      <div className="max-w-6xl w-full bg-[#0b6659] rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-12">
          
          {/* Left Section */}
          <div className="flex flex-col justify-center text-white">
            <h1 className="text-5xl font-bold mb-6">Book a free demo</h1>
            
            <p className="text-lg text-teal-100 mb-8">
              This will be a 30-minute call to understand your needs better and give you a glimpse of our product and offerings.
            </p>

            {/* Platform Icons Section */}
            <div className="bg-[#073e35] rounded-2xl p-8 mb-8">
              <div className="flex justify-center items-end gap-6 mb-8 h-24">
                {/* WhatsApp */}
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <MessageCircle size={40} className="text-green-500" />
                </div>
                {/* Instagram */}
                {/* <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <Instagram size={40} className="text-pink-500" />
                </div> */}
                {/* Messenger/Chat */}
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <Mail size={40} className="text-blue-500" />
                </div>
                {/* Messenger */}
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <Send size={40} className="text-purple-500" />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-3">Engage your audience where they are</h2>
              <p className="text-teal-100 leading-relaxed">
                Reach your customers on their preferred platforms - We support omnichannel conversations across over multiple channels, including WhatsApp, Instagram, SMS and RCS.
              </p>
            </div>
          </div>

          {/* Right Section - Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                name="firstName"
                placeholder="First name*"
                value={formData.firstName}
                onChange={handleChange}
                className="bg-white text-gray-800 placeholder:text-gray-500 rounded-2xl h-12"
                required
              />
              <Input
                type="text"
                name="lastName"
                placeholder="Last name*"
                value={formData.lastName}
                onChange={handleChange}
                className="bg-white text-gray-800 placeholder:text-gray-500 rounded-2xl h-12"
                required
              />
            </div>

            {/* Phone */}
            <Input
              type="tel"
              name="phone"
              placeholder="Phone no."
              value={formData.phone}
              onChange={handleChange}
              className="bg-white text-gray-800 placeholder:text-gray-500 rounded-2xl h-12"
            />

            {/* Email */}
            <Input
              type="email"
              name="email"
              placeholder="Business email*"
              value={formData.email}
              onChange={handleChange}
              className="bg-white text-gray-800 placeholder:text-gray-500 rounded-2xl h-12"
              required
            />

            {/* Company */}
            <Input
              type="text"
              name="company"
              placeholder="Company name*"
              value={formData.company}
              onChange={handleChange}
              className="bg-white text-gray-800 placeholder:text-gray-500 rounded-2xl h-12"
              required
            />

            {/* Country */}
            <Input
              type="text"
              name="country"
              placeholder="Country*"
              value={formData.country}
              onChange={handleChange}
              className="bg-white text-gray-800 placeholder:text-gray-500 rounded-2xl h-12"
              required
            />

            {/* Company Size */}
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              className="w-full bg-white text-gray-800 placeholder:text-gray-500 rounded-2xl h-12 px-3 border border-input"
            >
              <option value="">Company Size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201+">201+ employees</option>
            </select>

            {/* Overview Textarea */}
            <Textarea
              name="overview"
              placeholder="What is a brief overview of what you're hoping to learn in the demo?"
              value={formData.overview}
              onChange={handleChange}
              className="bg-white text-gray-800 placeholder:text-gray-500 rounded-2xl min-h-[120px]"
            />

            {/* Checkboxes */}
            <div className="flex flex-col gap-3 my-2">
              <label className="flex items-center gap-3 text-white cursor-pointer">
                <Checkbox
                  checked={formData.refundPolicy}
                  onCheckedChange={(checked) => handleCheckboxChange('refundPolicy', checked)}
                />
                <span className="text-sm">I agree to the Refund and Cancellation Clause and Privacy Policy Statement</span>
              </label>
              <label className="flex items-center gap-3 text-white cursor-pointer">
                <Checkbox
                  checked={formData.privacyPolicy}
                  onCheckedChange={(checked) => handleCheckboxChange('privacyPolicy', checked)}
                />
                <span className="text-sm">I agree to the Refund and Cancellation Clause</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 rounded-full bg-white text-teal-700 hover:bg-gray-100 font-semibold text-lg mt-4"
            >
              Book my demo
            </Button>
            <p className="text-xs text-center text-gray-300 mt-2">reCAPTCHA</p>
          </form>
        </div>
      </div>
    </div>
  )
}