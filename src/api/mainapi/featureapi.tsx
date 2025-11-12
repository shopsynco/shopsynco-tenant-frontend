import axiosInstance from "../../store/refreshToken/tokenUtils";

/* Get all available features */
export const getFeatureStore = async () => {
  const res = await axiosInstance.get(
    `/api/tenants/pqrs_company/feature-store/`
  );
  return res.data;
};

/* Get user's active features */
export const getMyFeatures = async () => {
  const res = await axiosInstance.get(
    `/api/tenants/pqrs_company/feature-store/my-features/`
  );
  return res.data;
};

/* Add a feature */
export const addFeature = async (feature_id: string) => {
  const res = await axiosInstance.post(
    `/api/tenants/pqrs_company/feature-store/add/`,
    { feature_id }
  );
  return res.data;
};

/* Remove a feature */
export const removeFeature = async (feature_id: string) => {
  const res = await axiosInstance.post(
    `/api/tenants/pqrs_company/feature-store/remove/`,
    { feature_id }
  );
  return res.data;
};
