import { useState, useEffect } from "react";
import { Search, UserPlus, ShoppingBag, User, MapPin, Phone, Mail, Calendar, PlusCircle, Eye } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { searchCustomerByPhone, clearCustomerState, fetchAllCustomers } from "../../features/customer/customerSlice";
import { useNavigate } from "react-router-dom";
import showToast from "../../utils/toast";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customers, loading, error } = useSelector((state) => state.customer);
  const { user } = useSelector((state) => state.auth);

  const rolePath = user?.role === "ADMIN" ? "admin" : 
                   user?.role === "MANAGER" ? "manager" :
                   user?.role === "STORE_KEEPER" ? "storekeeper" : 
                   "cuttingmaster";

  // Fetch all customers on component mount
  useEffect(() => {
    dispatch(fetchAllCustomers());
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast.error(error);
    }
  }, [error]);

  // 🔍 Search Logic - Filters the list in real-time
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Remove any non-digit characters and check length
    const cleanPhone = searchTerm.replace(/\D/g, '');
    
    if (cleanPhone.length > 0 && cleanPhone.length !== 10) {
      return showToast.error("Enter valid 10-digit number");
    }
    
    // If valid phone, search - otherwise show all customers
    if (cleanPhone.length === 10) {
      dispatch(searchCustomerByPhone(cleanPhone));
    } else {
      dispatch(clearCustomerState());
      dispatch(fetchAllCustomers());
    }
  };

  // Handle input change with phone formatting
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setSearchTerm(value);
    
    // If search is cleared, show all customers
    if (value.length === 0) {
      dispatch(clearCustomerState());
      dispatch(fetchAllCustomers());
    }
  };

  // Filter customers based on search
  const filteredCustomers = searchTerm.length === 10 && customers?.length > 0
    ? customers.filter(c => c.phone?.includes(searchTerm))
    : customers;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Get customer full name
  const getCustomerName = (customer) => {
    // If name field exists, use it
    if (customer.name) return customer.name;
    
    // Otherwise combine fields
    return `${customer.salutation || ''} ${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown';
  };

  // Navigate to customer details
  const viewCustomerDetails = (customerId) => {
    navigate(`/${rolePath}/customers/${customerId}`);
  };

  // Navigate to add customer page
  const goToAddCustomer = () => {
    navigate(`/${rolePath}/add-customer`);
  };

  // Navigate to create order
  const goToCreateOrder = (customer) => {
    navigate(`/${rolePath}/create-order`, { state: { customer } });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Customers</h1>
          <p className="text-slate-500 font-medium">Search, view, and manage your customers.</p>
        </div>

        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by Phone Number..." 
                className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 w-80 font-bold transition-all"
                value={searchTerm} 
                onChange={handlePhoneChange}
                maxLength="10"
              />
            </div>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
          
          {/* Add Customer Button */}
          <button
            onClick={goToAddCustomer}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/25 flex items-center gap-2"
          >
            <PlusCircle size={20} />
            <span className="hidden lg:inline">Add New</span>
          </button>
        </div>
      </div>

      {/* SEARCH RESULT INFO */}
      {searchTerm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-slate-700">
              Search results for <span className="font-black text-blue-600">{searchTerm}</span>
            </span>
          </div>
          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
            {filteredCustomers?.length || 0} found
          </span>
        </div>
      )}

      {/* CUSTOMERS LIST */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User size={24} className="text-blue-600" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">All Customers</h2>
          </div>
          <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm font-bold">
            {filteredCustomers?.length || 0} Total
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading customers...</p>
          </div>
        ) : filteredCustomers?.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredCustomers.map((customer) => {
              const customerName = getCustomerName(customer);
              
              return (
                <div 
                  key={customer._id} 
                  className="p-5 hover:bg-slate-50 transition-all group cursor-pointer"
                  onClick={() => viewCustomerDetails(customer._id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                        <span className="text-xl font-black">
                          {customerName?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div className="flex-1">
                        {/* ✅ Customer Name displayed prominently */}
                        <h3 className="font-black text-slate-800 text-lg mb-1">{customerName}</h3>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <span className="flex items-center gap-1.5 text-sm bg-slate-100 px-3 py-1 rounded-full">
                            <Phone size={12} className="text-blue-600" /> 
                            <span className="font-medium text-slate-700">{customer.phone}</span>
                          </span>
                          
                          {/* ✅ Email is now smaller and less prominent */}
                          {customer.email && (
                            <span className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Mail size={10} /> {customer.email}
                            </span>
                          )}
                          
                          <span className="flex items-center gap-1.5 text-sm bg-purple-50 px-3 py-1 rounded-full">
                            <ShoppingBag size={12} className="text-purple-600" /> 
                            <span className="font-medium text-purple-700">{customer.totalOrders || 0} orders</span>
                          </span>
                          
                          <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Calendar size={10} /> {formatDate(customer.createdAt)}
                          </span>
                        </div>
                        
                        {customer.address && (
                          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                            <MapPin size={10} className="text-slate-400" />
                            {typeof customer.address === 'string' 
                              ? customer.address 
                              : customer.address?.line1 || 'Address available'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 md:ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToCreateOrder(customer);
                        }}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm"
                      >
                        <ShoppingBag size={14} /> Order
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewCustomerDetails(customer._id);
                        }}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm"
                      >
                        <Eye size={14} /> View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <User size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-black text-xl">No Customers Found</p>
            <p className="text-slate-300 mt-2">
              {searchTerm ? `No customer with phone ${searchTerm}` : 'Register your first customer to get started'}
            </p>
            <button
              onClick={goToAddCustomer}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all"
            >
              Add New Customer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}