import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "../../redux/features/cmsApi";
import toast from "react-hot-toast";

export default function BusinessSettings() {
  const { notify, storeSettings, updateStoreSettings } = useAdminUI();
  const { data: serverSettingsData } = useGetSettingsQuery();
  const [updateSettingsApi, { isLoading }] = useUpdateSettingsMutation();

  const [bkashNumber, setBkashNumber] = useState("01712-345678");
  const [accountType, setAccountType] = useState("Personal Send Money");
  const [insideDhaka, setInsideDhaka] = useState(60);
  const [outsideDhaka, setOutsideDhaka] = useState(120);

  useEffect(() => {
    const live = serverSettingsData?.data || serverSettingsData;
    if (live) {
      if (live.phone) setBkashNumber(live.phone);
      if (live.insideDhakaFee) setInsideDhaka(live.insideDhakaFee);
      if (live.outsideDhakaFee) setOutsideDhaka(live.outsideDhakaFee);
    }
  }, [serverSettingsData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      phone: bkashNumber,
      insideDhakaFee: Number(insideDhaka),
      outsideDhakaFee: Number(outsideDhaka),
      standardShippingFee: Number(insideDhaka),
      expressShippingFee: Number(outsideDhaka),
    };

    const toastId = toast.loading("Saving bKash & delivery settings...");
    try {
      await updateSettingsApi(payload).unwrap();
      updateStoreSettings(payload, true);
      toast.success("Business settings saved to database!", { id: toastId });
    } catch (err) {
      updateStoreSettings(payload, true);
      toast.success("Settings saved to cache!", { id: toastId });
    }
  };

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Display bKash number
          <input
            value={bkashNumber}
            onChange={(e) => setBkashNumber(e.target.value)}
            placeholder="01712-345678"
          />
        </label>
        <label>
          Account type
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            <option value="Personal Send Money">Personal Send Money</option>
            <option value="Merchant">Merchant</option>
          </select>
        </label>
        <label>
          Inside Dhaka fee (BDT)
          <input
            type="number"
            value={insideDhaka}
            onChange={(e) => setInsideDhaka(e.target.value)}
          />
        </label>
        <label>
          Outside Dhaka fee (BDT)
          <input
            type="number"
            value={outsideDhaka}
            onChange={(e) => setOutsideDhaka(e.target.value)}
          />
        </label>
      </div>
      <button type="submit" disabled={isLoading} className="button cursor-pointer">
        <Save size={14} /> {isLoading ? "Saving..." : "Save business settings"}
      </button>
    </form>
  );
}

