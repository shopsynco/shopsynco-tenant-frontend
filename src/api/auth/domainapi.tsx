import axios from "axios";

const hostingerAPI = import.meta.env.VITE_HOSTINGER_API!;
const hostingerToken = import.meta.env.VITE_HOSTINGER_TOKEN!;

export const checkDomainAvailability = async (domain: string) => {
  try {
    const cleanDomain = domain.replace(/\.(com|net|org|io|co)$/i, "");

    const payload = {
      domain: cleanDomain,
      tlds: ["com"], // ✅ only one TLD when asking for alternatives
      with_alternatives: true,
    };

    console.log("Payload sent to Hostinger:", payload);

    const response = await axios.post(hostingerAPI, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hostingerToken}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Domain check failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Domain check failed");
  }
};
