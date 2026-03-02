// // features/work/workSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import showToast from '../../utils/toast';
// import * as workApi from './workApi';

// const initialState = {
//   works: [],
//   myWorks: [], // For cutting master
//   tailorWorks: [], // For tailor
//   currentWork: null,
//   stats: {
//     totalWorks: 0,
//     pendingWorks: 0,
//     acceptedWorks: 0,
//     cuttingStarted: 0,
//     cuttingCompleted: 0,
//     sewingStarted: 0,
//     sewingCompleted: 0,
//     ironing: 0,
//     readyToDeliver: 0,
//     todayWorks: 0,
//     overdueWorks: 0
//   },
//   pagination: {
//     page: 1,
//     limit: 20,
//     total: 0,
//     pages: 0
//   },
//   loading: false,
//   error: null,
//   filters: {
//     status: '',
//     search: '',
//     startDate: '',
//     endDate: '',
//     page: 1,
//     limit: 20
//   }
// };

// // Async Thunks
// export const fetchWorks = createAsyncThunk(
//   'work/fetchWorks',
//   async (filters = {}, { rejectWithValue, getState }) => {
//     try {
//       const { work } = getState();
//       const currentFilters = { ...work.filters, ...filters };
//       const response = await workApi.getWorks(currentFilters);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch works');
//     }
//   }
// );

// export const fetchMyWorks = createAsyncThunk(
//   'work/fetchMyWorks',
//   async (filters = {}, { rejectWithValue }) => {
//     try {
//       const response = await workApi.getMyWorks(filters);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch your works');
//     }
//   }
// );

// export const fetchWorkById = createAsyncThunk(
//   'work/fetchWorkById',
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await workApi.getWorkById(id);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch work');
//     }
//   }
// );

// export const fetchWorkStats = createAsyncThunk(
//   'work/fetchWorkStats',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await workApi.getWorkStats();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
//     }
//   }
// );

// export const acceptWorkById = createAsyncThunk(
//   'work/acceptWorkById',
//   async (id, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await workApi.acceptWork(id);
//       showToast.success('Work accepted successfully');
//       dispatch(fetchMyWorks());
//       dispatch(fetchWorks());
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to accept work');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// export const assignTailorToWork = createAsyncThunk(
//   'work/assignTailorToWork',
//   async ({ id, tailorId }, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await workApi.assignTailor(id, tailorId);
//       showToast.success('Tailor assigned successfully');
//       dispatch(fetchMyWorks());
//       dispatch(fetchWorkById(id));
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to assign tailor');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// export const updateWorkStatusById = createAsyncThunk(
//   'work/updateWorkStatusById',
//   async ({ id, status, notes }, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await workApi.updateWorkStatus(id, { status, notes });
//       showToast.success(`Work status updated to ${status}`);
//       dispatch(fetchMyWorks());
//       dispatch(fetchWorkById(id));
//       return response.data;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to update status');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// export const deleteWorkById = createAsyncThunk(
//   'work/deleteWorkById',
//   async (id, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await workApi.deleteWork(id);
//       showToast.success('Work deleted successfully');
//       dispatch(fetchWorks());
//       return id;
//     } catch (error) {
//       showToast.error(error.response?.data?.message || 'Failed to delete work');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// const workSlice = createSlice({
//   name: 'work',
//   initialState,
//   reducers: {
//     setFilters: (state, action) => {
//       state.filters = { ...state.filters, ...action.payload };
//     },
//     resetFilters: (state) => {
//       state.filters = initialState.filters;
//     },
//     clearCurrentWork: (state) => {
//       state.currentWork = null;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch Works
//       .addCase(fetchWorks.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchWorks.fulfilled, (state, action) => {
//         state.loading = false;
//         state.works = action.payload.works || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//         if (action.payload.statusCounts) {
//           state.stats = { ...state.stats, ...action.payload.statusCounts };
//         }
//       })
//       .addCase(fetchWorks.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Fetch My Works (Cutting Master)
//       .addCase(fetchMyWorks.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchMyWorks.fulfilled, (state, action) => {
//         state.loading = false;
//         state.myWorks = action.payload.works || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchMyWorks.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Fetch Work By ID
//       .addCase(fetchWorkById.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchWorkById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentWork = action.payload;
//       })
//       .addCase(fetchWorkById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Fetch Work Stats
//       .addCase(fetchWorkStats.fulfilled, (state, action) => {
//         state.stats = { ...state.stats, ...action.payload };
//       });
//   }
// });

// export const { setFilters, resetFilters, clearCurrentWork } = workSlice.actions;

// // Selectors
// export const selectAllWorks = (state) => state.work.works;
// export const selectMyWorks = (state) => state.work.myWorks;
// export const selectCurrentWork = (state) => state.work.currentWork;
// export const selectWorkStats = (state) => state.work.stats;
// export const selectWorkPagination = (state) => state.work.pagination;
// export const selectWorkFilters = (state) => state.work.filters;
// export const selectWorkLoading = (state) => state.work.loading;

// export default workSlice.reducer;


// // features/work/workSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import showToast from '../../utils/toast';
// import * as workApi from './workApi';

// const initialState = {
//   works: [],
//   myWorks: [], // For cutting master
//   tailorWorks: [], // For tailor
//   currentWork: null,
//   stats: {
//     totalWorks: 0,
//     pendingWorks: 0,
//     acceptedWorks: 0,
//     cuttingStarted: 0,
//     cuttingCompleted: 0,
//     sewingStarted: 0,
//     sewingCompleted: 0,
//     ironing: 0,
//     readyToDeliver: 0,
//     todayWorks: 0,
//     overdueWorks: 0
//   },
//   pagination: {
//     page: 1,
//     limit: 20,
//     total: 0,
//     pages: 0
//   },
//   loading: false,
//   error: null,
//   filters: {
//     status: '',
//     search: '',
//     startDate: '',
//     endDate: '',
//     page: 1,
//     limit: 20
//   }
// };

// // Async Thunks
// export const fetchWorks = createAsyncThunk(
//   'work/fetchWorks',
//   async (filters = {}, { rejectWithValue, getState }) => {
//     console.log('📋 [fetchWorks] called with filters:', filters);
//     try {
//       const { work } = getState();
//       const currentFilters = { ...work.filters, ...filters };
//       console.log('📋 [fetchWorks] current filters:', currentFilters);
      
//       const response = await workApi.getWorks(currentFilters);
//       console.log('📋 [fetchWorks] response:', response);
//       return response.data;
//     } catch (error) {
//       console.error('❌ [fetchWorks] error:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch works');
//     }
//   }
// );

// export const fetchMyWorks = createAsyncThunk(
//   'work/fetchMyWorks',
//   async (filters = {}, { rejectWithValue }) => {
//     console.log('📋 [fetchMyWorks] called with filters:', filters);
//     try {
//       const response = await workApi.getMyWorks(filters);
//       console.log('📋 [fetchMyWorks] response:', response);
//       return response.data;
//     } catch (error) {
//       console.error('❌ [fetchMyWorks] error:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch your works');
//     }
//   }
// );

// export const fetchWorkById = createAsyncThunk(
//   'work/fetchWorkById',
//   async (id, { rejectWithValue }) => {
//     console.log('📋 [fetchWorkById] called with id:', id);
//     try {
//       const response = await workApi.getWorkById(id);
//       console.log('📋 [fetchWorkById] response:', response);
//       return response.data;
//     } catch (error) {
//       console.error('❌ [fetchWorkById] error:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch work');
//     }
//   }
// );

// export const fetchWorkStats = createAsyncThunk(
//   'work/fetchWorkStats',
//   async (_, { rejectWithValue }) => {
//     console.log('📊 [fetchWorkStats] called');
//     try {
//       const response = await workApi.getWorkStats();
//       console.log('📊 [fetchWorkStats] response:', response);
//       return response.data;
//     } catch (error) {
//       console.error('❌ [fetchWorkStats] error:', error);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
//     }
//   }
// );

// export const acceptWorkById = createAsyncThunk(
//   'work/acceptWorkById',
//   async (id, { rejectWithValue, dispatch }) => {
//     console.log('✅ [acceptWorkById] called with id:', id);
//     try {
//       const response = await workApi.acceptWork(id);
//       console.log('✅ [acceptWorkById] response:', response);
      
//       showToast.success('Work accepted successfully');
//       dispatch(fetchMyWorks());
//       dispatch(fetchWorks());
//       return response.data;
//     } catch (error) {
//       console.error('❌ [acceptWorkById] error:', error);
//       showToast.error(error.response?.data?.message || 'Failed to accept work');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// export const assignTailorToWork = createAsyncThunk(
//   'work/assignTailorToWork',
//   async ({ id, tailorId }, { rejectWithValue, dispatch }) => {
//     console.log('👔 [assignTailorToWork] called with:', { id, tailorId });
//     try {
//       const response = await workApi.assignTailor(id, tailorId);
//       console.log('👔 [assignTailorToWork] response:', response);
      
//       showToast.success('Tailor assigned successfully');
//       dispatch(fetchMyWorks());
//       dispatch(fetchWorkById(id));
//       return response.data;
//     } catch (error) {
//       console.error('❌ [assignTailorToWork] error:', error);
//       showToast.error(error.response?.data?.message || 'Failed to assign tailor');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // ✅ FIXED: updateWorkStatusById with comprehensive debugging
// export const updateWorkStatusById = createAsyncThunk(
//   'work/updateWorkStatusById',
//   async ({ id, status, notes }, { rejectWithValue, dispatch }) => {
//     console.log('\n🔄 ===== UPDATE WORK STATUS THUNK STARTED =====');
//     console.log('📦 Input values:', { 
//       id, 
//       status, 
//       notes: notes || '(empty)',
//       statusType: typeof status,
//       idType: typeof id
//     });
    
//     // Validate inputs
//     if (!id) {
//       console.error('❌ No work ID provided');
//       showToast.error('Work ID is missing');
//       return rejectWithValue('Work ID is required');
//     }
    
//     if (!status) {
//       console.error('❌ No status provided');
//       showToast.error('Please select a status');
//       return rejectWithValue('Status is required');
//     }
    
//     try {
//       console.log('📤 Calling workApi.updateWorkStatus with:', { 
//         id, 
//         statusData: { 
//           status: status, 
//           notes: notes || '' 
//         } 
//       });
      
//       // Make the API call
//       const response = await workApi.updateWorkStatus(id, { 
//         status: status, 
//         notes: notes || '' 
//       });
      
//       console.log('✅ API Response:', response);
      
//       // Check if response is successful
//       if (response && response.success) {
//         const statusDisplay = status.replace(/-/g, ' ');
//         showToast.success(`Work status updated to ${statusDisplay}`);
//         console.log(`✅ Status updated to: ${statusDisplay}`);
//       } else {
//         console.warn('⚠️ API response indicated failure:', response);
//       }
      
//       // Refresh data
//       console.log('🔄 Refreshing works data...');
//       await dispatch(fetchMyWorks());
//       await dispatch(fetchWorkById(id));
      
//       console.log('🔄 ===== UPDATE WORK STATUS THUNK COMPLETED =====\n');
//       return response.data;
      
//     } catch (error) {
//       console.error('\n❌ ===== UPDATE WORK STATUS ERROR =====');
//       console.error('Error object:', error);
//       console.error('Error response:', error.response?.data);
//       console.error('Error status:', error.response?.status);
//       console.error('Error message:', error.message);
//       console.error('❌ ===== ERROR END =====\n');
      
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to update status';
//       showToast.error(errorMessage);
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// export const deleteWorkById = createAsyncThunk(
//   'work/deleteWorkById',
//   async (id, { rejectWithValue, dispatch }) => {
//     console.log('🗑️ [deleteWorkById] called with id:', id);
//     try {
//       const response = await workApi.deleteWork(id);
//       console.log('🗑️ [deleteWorkById] response:', response);
      
//       showToast.success('Work deleted successfully');
//       dispatch(fetchWorks());
//       return id;
//     } catch (error) {
//       console.error('❌ [deleteWorkById] error:', error);
//       showToast.error(error.response?.data?.message || 'Failed to delete work');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// const workSlice = createSlice({
//   name: 'work',
//   initialState,
//   reducers: {
//     setFilters: (state, action) => {
//       console.log('🎯 [setFilters]', action.payload);
//       state.filters = { ...state.filters, ...action.payload };
//     },
//     resetFilters: (state) => {
//       console.log('🔄 [resetFilters]');
//       state.filters = initialState.filters;
//     },
//     clearCurrentWork: (state) => {
//       console.log('🧹 [clearCurrentWork]');
//       state.currentWork = null;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch Works
//       .addCase(fetchWorks.pending, (state) => {
//         state.loading = true;
//         console.log('🔄 [fetchWorks] pending');
//       })
//       .addCase(fetchWorks.fulfilled, (state, action) => {
//         state.loading = false;
//         state.works = action.payload.works || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//         if (action.payload.statusCounts) {
//           state.stats = { ...state.stats, ...action.payload.statusCounts };
//         }
//         console.log('✅ [fetchWorks] fulfilled, works:', state.works.length);
//       })
//       .addCase(fetchWorks.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         console.error('❌ [fetchWorks] rejected:', action.payload);
//       })
      
//       // Fetch My Works (Cutting Master)
//       .addCase(fetchMyWorks.pending, (state) => {
//         state.loading = true;
//         console.log('🔄 [fetchMyWorks] pending');
//       })
//       .addCase(fetchMyWorks.fulfilled, (state, action) => {
//         state.loading = false;
//         state.myWorks = action.payload.works || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//         console.log('✅ [fetchMyWorks] fulfilled, myWorks:', state.myWorks.length);
//       })
//       .addCase(fetchMyWorks.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         console.error('❌ [fetchMyWorks] rejected:', action.payload);
//       })
      
//       // Fetch Work By ID
//       .addCase(fetchWorkById.pending, (state) => {
//         state.loading = true;
//         console.log('🔄 [fetchWorkById] pending');
//       })
//       .addCase(fetchWorkById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentWork = action.payload;
//         console.log('✅ [fetchWorkById] fulfilled');
//       })
//       .addCase(fetchWorkById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         console.error('❌ [fetchWorkById] rejected:', action.payload);
//       })
      
//       // Fetch Work Stats
//       .addCase(fetchWorkStats.pending, (state) => {
//         console.log('🔄 [fetchWorkStats] pending');
//       })
//       .addCase(fetchWorkStats.fulfilled, (state, action) => {
//         state.stats = { ...state.stats, ...action.payload };
//         console.log('✅ [fetchWorkStats] fulfilled');
//       })
//       .addCase(fetchWorkStats.rejected, (state, action) => {
//         state.error = action.payload;
//         console.error('❌ [fetchWorkStats] rejected:', action.payload);
//       });
//   }
// });

// export const { setFilters, resetFilters, clearCurrentWork } = workSlice.actions;

// // Selectors
// export const selectAllWorks = (state) => state.work.works;
// export const selectMyWorks = (state) => state.work.myWorks;
// export const selectCurrentWork = (state) => state.work.currentWork;
// export const selectWorkStats = (state) => state.work.stats;
// export const selectWorkPagination = (state) => state.work.pagination;
// export const selectWorkFilters = (state) => state.work.filters;
// export const selectWorkLoading = (state) => state.work.loading;

// export default workSlice.reducer;




// features/work/workSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import showToast from '../../utils/toast';
import * as workApi from './workApi';

const initialState = {
  works: [],
  myWorks: [], // For cutting master
  tailorWorks: [], // For tailor
  currentWork: null,
  stats: {
    totalWorks: 0,
    pendingWorks: 0,
    acceptedWorks: 0,
    cuttingStarted: 0,
    cuttingCompleted: 0,
    sewingStarted: 0,
    sewingCompleted: 0,
    ironing: 0,
    readyToDeliver: 0,
    todayWorks: 0,
    overdueWorks: 0
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  loading: false,
  error: null,
  filters: {
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  }
};

// Async Thunks
export const fetchWorks = createAsyncThunk(
  'work/fetchWorks',
  async (filters = {}, { rejectWithValue, getState }) => {
    console.log('📋 [fetchWorks] called with filters:', filters);
    try {
      const { work } = getState();
      const currentFilters = { ...work.filters, ...filters };
      console.log('📋 [fetchWorks] current filters:', currentFilters);
      
      const response = await workApi.getWorks(currentFilters);
      console.log('📋 [fetchWorks] response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ [fetchWorks] error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch works');
    }
  }
);

export const fetchMyWorks = createAsyncThunk(
  'work/fetchMyWorks',
  async (filters = {}, { rejectWithValue }) => {
    console.log('📋 [fetchMyWorks] called with filters:', filters);
    try {
      const response = await workApi.getMyWorks(filters);
      console.log('📋 [fetchMyWorks] response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ [fetchMyWorks] error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your works');
    }
  }
);

export const fetchWorkById = createAsyncThunk(
  'work/fetchWorkById',
  async (id, { rejectWithValue }) => {
    console.log('📋 [fetchWorkById] called with id:', id);
    try {
      const response = await workApi.getWorkById(id);
      console.log('📋 [fetchWorkById] response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ [fetchWorkById] error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch work');
    }
  }
);

export const fetchWorkStats = createAsyncThunk(
  'work/fetchWorkStats',
  async (_, { rejectWithValue }) => {
    console.log('📊 [fetchWorkStats] called');
    try {
      const response = await workApi.getWorkStats();
      console.log('📊 [fetchWorkStats] response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ [fetchWorkStats] error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

// ✅ FIXED: acceptWorkById - Removed fetchWorks (which causes 403)
export const acceptWorkById = createAsyncThunk(
  'work/acceptWorkById',
  async (id, { rejectWithValue, dispatch }) => {
    console.log('✅ [acceptWorkById] called with id:', id);
    try {
      const response = await workApi.acceptWork(id);
      console.log('✅ [acceptWorkById] response:', response);
      
      showToast.success('Work accepted successfully');
      
      // ✅ ONLY refresh cutting master's works and current work
      await dispatch(fetchMyWorks());
      await dispatch(fetchWorkById(id));
      
      return response.data;
    } catch (error) {
      console.error('❌ [acceptWorkById] error:', error);
      showToast.error(error.response?.data?.message || 'Failed to accept work');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const assignTailorToWork = createAsyncThunk(
  'work/assignTailorToWork',
  async ({ id, tailorId }, { rejectWithValue, dispatch }) => {
    console.log('👔 [assignTailorToWork] called with:', { id, tailorId });
    try {
      const response = await workApi.assignTailor(id, tailorId);
      console.log('👔 [assignTailorToWork] response:', response);
      
      showToast.success('Tailor assigned successfully');
      dispatch(fetchMyWorks());
      dispatch(fetchWorkById(id));
      return response.data;
    } catch (error) {
      console.error('❌ [assignTailorToWork] error:', error);
      showToast.error(error.response?.data?.message || 'Failed to assign tailor');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateWorkStatusById = createAsyncThunk(
  'work/updateWorkStatusById',
  async ({ id, status, notes }, { rejectWithValue, dispatch }) => {
    console.log('\n🔄 ===== UPDATE WORK STATUS THUNK STARTED =====');
    console.log('📦 Input values:', { 
      id, 
      status, 
      notes: notes || '(empty)'
    });
    
    if (!id) {
      console.error('❌ No work ID provided');
      showToast.error('Work ID is missing');
      return rejectWithValue('Work ID is required');
    }
    
    if (!status) {
      console.error('❌ No status provided');
      showToast.error('Please select a status');
      return rejectWithValue('Status is required');
    }
    
    try {
      console.log('📤 Calling workApi.updateWorkStatus with:', { 
        id, 
        statusData: { 
          status: status, 
          notes: notes || '' 
        } 
      });
      
      const response = await workApi.updateWorkStatus(id, { 
        status: status, 
        notes: notes || '' 
      });
      
      console.log('✅ API Response:', response);
      
      if (response && response.success) {
        const statusDisplay = status.replace(/-/g, ' ');
        showToast.success(`Work status updated to ${statusDisplay}`);
      }
      
      // Refresh data
      await dispatch(fetchMyWorks());
      await dispatch(fetchWorkById(id));
      
      return response.data;
      
    } catch (error) {
      console.error('❌ [updateWorkStatusById] error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update status';
      showToast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteWorkById = createAsyncThunk(
  'work/deleteWorkById',
  async (id, { rejectWithValue, dispatch }) => {
    console.log('🗑️ [deleteWorkById] called with id:', id);
    try {
      const response = await workApi.deleteWork(id);
      console.log('🗑️ [deleteWorkById] response:', response);
      
      showToast.success('Work deleted successfully');
      dispatch(fetchWorks());
      return id;
    } catch (error) {
      console.error('❌ [deleteWorkById] error:', error);
      showToast.error(error.response?.data?.message || 'Failed to delete work');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ✅ NEW: Assign cutting master thunk
export const assignCuttingMasterToWork = createAsyncThunk(
  'work/assignCuttingMasterToWork',
  async ({ id, cuttingMasterId }, { rejectWithValue, dispatch }) => {
    console.log('✂️ [assignCuttingMasterToWork] called with:', { id, cuttingMasterId });
    try {
      const response = await workApi.assignCuttingMaster(id, cuttingMasterId);
      console.log('✂️ [assignCuttingMasterToWork] response:', response);
      
      showToast.success('Cutting master assigned successfully');
      dispatch(fetchMyWorks());
      dispatch(fetchWorkById(id));
      return response.data;
    } catch (error) {
      console.error('❌ [assignCuttingMasterToWork] error:', error);
      showToast.error(error.response?.data?.message || 'Failed to assign cutting master');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const workSlice = createSlice({
  name: 'work',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      console.log('🎯 [setFilters]', action.payload);
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      console.log('🔄 [resetFilters]');
      state.filters = initialState.filters;
    },
    clearCurrentWork: (state) => {
      console.log('🧹 [clearCurrentWork]');
      state.currentWork = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Works
      .addCase(fetchWorks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorks.fulfilled, (state, action) => {
        state.loading = false;
        state.works = action.payload.works || [];
        state.pagination = action.payload.pagination || initialState.pagination;
        if (action.payload.statusCounts) {
          state.stats = { ...state.stats, ...action.payload.statusCounts };
        }
      })
      .addCase(fetchWorks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch My Works (Cutting Master)
      .addCase(fetchMyWorks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyWorks.fulfilled, (state, action) => {
        state.loading = false;
        state.myWorks = action.payload.works || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchMyWorks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Work By ID
      .addCase(fetchWorkById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWork = action.payload;
      })
      .addCase(fetchWorkById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Work Stats
      .addCase(fetchWorkStats.fulfilled, (state, action) => {
        state.stats = { ...state.stats, ...action.payload };
      })
      
      // Accept Work
      .addCase(acceptWorkById.fulfilled, (state, action) => {
        // Update the work in myWorks if present
        if (action.payload && state.myWorks.length > 0) {
          const index = state.myWorks.findIndex(w => w._id === action.payload._id);
          if (index !== -1) {
            state.myWorks[index] = action.payload;
          }
        }
      });
  }
});

export const { setFilters, resetFilters, clearCurrentWork } = workSlice.actions;

// Selectors
export const selectAllWorks = (state) => state.work.works;
export const selectMyWorks = (state) => state.work.myWorks;
export const selectCurrentWork = (state) => state.work.currentWork;
export const selectWorkStats = (state) => state.work.stats;
export const selectWorkPagination = (state) => state.work.pagination;
export const selectWorkFilters = (state) => state.work.filters;
export const selectWorkLoading = (state) => state.work.loading;

export default workSlice.reducer;