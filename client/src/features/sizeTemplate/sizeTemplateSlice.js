import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as sizeTemplateApi from "./sizeTemplateApi";

// ===== FETCH ALL TEMPLATES (Active only - for regular users) =====
export const fetchAllTemplates = createAsyncThunk(
  "sizeTemplate/fetchAll",
  async ({ page = 1, search = "" }, { rejectWithValue }) => {
    try {
      console.log(`📡 Fetching templates - Page: ${page}, Search: "${search}"`);
      const response = await sizeTemplateApi.getAllTemplatesApi(page, search, false);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch templates");
    }
  }
);

// ===== FETCH ALL TEMPLATES (Including inactive - Admin only) =====
export const fetchAllTemplatesAdmin = createAsyncThunk(
  "sizeTemplate/fetchAllAdmin",
  async ({ page = 1, search = "" }, { rejectWithValue }) => {
    try {
      console.log(`📡 Admin fetching all templates - Page: ${page}, Search: "${search}"`);
      const response = await sizeTemplateApi.getAllTemplatesApi(page, search, true);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch templates");
    }
  }
);

// ===== FETCH SINGLE TEMPLATE BY ID =====
export const fetchTemplateById = createAsyncThunk(
  "sizeTemplate/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`📡 Fetching template by ID: ${id}`);
      const response = await sizeTemplateApi.getTemplateByIdApi(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch template");
    }
  }
);

// ===== CREATE NEW TEMPLATE =====
export const createTemplate = createAsyncThunk(
  "sizeTemplate/create",
  async (templateData, { rejectWithValue }) => {
    try {
      console.log("📝 Creating template:", templateData);
      const response = await sizeTemplateApi.createTemplateApi(templateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create template");
    }
  }
);

// ===== UPDATE TEMPLATE =====
export const updateTemplate = createAsyncThunk(
  "sizeTemplate/update",
  async ({ id, templateData }, { rejectWithValue }) => {
    try {
      console.log(`📝 Updating template ${id}:`, templateData);
      const response = await sizeTemplateApi.updateTemplateApi(id, templateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update template");
    }
  }
);

// ===== DELETE TEMPLATE =====
export const deleteTemplate = createAsyncThunk(
  "sizeTemplate/delete",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`🗑️ Deleting template: ${id}`);
      await sizeTemplateApi.deleteTemplateApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete template");
    }
  }
);

// ===== TOGGLE TEMPLATE STATUS =====
export const toggleTemplateStatus = createAsyncThunk(
  "sizeTemplate/toggle",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`🔄 Toggling template status: ${id}`);
      const response = await sizeTemplateApi.toggleTemplateStatusApi(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
    }
  }
);

const sizeTemplateSlice = createSlice({
  name: "sizeTemplate",
  initialState: {
    templates: [],
    currentTemplate: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 1
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentTemplate: (state) => {
      state.currentTemplate = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH ALL TEMPLATES =====
      .addCase(fetchAllTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.templates;
        state.pagination = action.payload.pagination;
        console.log("✅ Templates loaded:", action.payload.templates?.length);
      })
      .addCase(fetchAllTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH ALL TEMPLATES (ADMIN) =====
      .addCase(fetchAllTemplatesAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTemplatesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.templates;
        state.pagination = action.payload.pagination;
        console.log("✅ Admin templates loaded:", action.payload.templates?.length);
      })
      .addCase(fetchAllTemplatesAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH SINGLE TEMPLATE =====
      .addCase(fetchTemplateById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentTemplate = null;
      })
      .addCase(fetchTemplateById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTemplate = action.payload;
        console.log("✅ Template loaded:", action.payload?.name);
      })
      .addCase(fetchTemplateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentTemplate = null;
      })

      // ===== CREATE TEMPLATE =====
      .addCase(createTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const newTemplate = action.payload.template || action.payload;
        if (newTemplate && newTemplate._id) {
          state.templates = [newTemplate, ...state.templates];
          state.pagination.total += 1;
          state.pagination.pages = Math.ceil(state.pagination.total / state.pagination.limit);
          console.log("✅ Template created:", newTemplate.name);
        }
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== UPDATE TEMPLATE =====
      .addCase(updateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTemplate = action.payload.template || action.payload;
        if (updatedTemplate && updatedTemplate._id) {
          const index = state.templates.findIndex(t => t._id === updatedTemplate._id);
          if (index !== -1) {
            state.templates[index] = updatedTemplate;
          }
          if (state.currentTemplate?._id === updatedTemplate._id) {
            state.currentTemplate = updatedTemplate;
          }
          console.log("✅ Template updated:", updatedTemplate.name);
        }
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== DELETE TEMPLATE =====
      .addCase(deleteTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.templates = state.templates.filter(t => t._id !== deletedId);
        if (state.currentTemplate?._id === deletedId) {
          state.currentTemplate = null;
        }
        state.pagination.total -= 1;
        state.pagination.pages = Math.ceil(state.pagination.total / state.pagination.limit);
        console.log("✅ Template deleted, ID:", deletedId);
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== TOGGLE TEMPLATE STATUS =====
      .addCase(toggleTemplateStatus.pending, (state) => {
        console.log("🔄 Toggling status...");
      })
      .addCase(toggleTemplateStatus.fulfilled, (state, action) => {
        const toggledId = action.meta.arg;
        const index = state.templates.findIndex(t => t._id === toggledId);
        if (index !== -1) {
          state.templates[index].isActive = !state.templates[index].isActive;
        }
        if (state.currentTemplate?._id === toggledId) {
          state.currentTemplate.isActive = !state.currentTemplate.isActive;
        }
        console.log("✅ Status toggled for ID:", toggledId);
      })
      .addCase(toggleTemplateStatus.rejected, (state, action) => {
        console.error("❌ Toggle failed:", action.payload);
      });
  },
});

export const { clearCurrentTemplate, clearError } = sizeTemplateSlice.actions;
export default sizeTemplateSlice.reducer;