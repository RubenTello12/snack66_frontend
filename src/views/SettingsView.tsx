import { useEffect, useState } from "react";
import { useSettings } from "../context/SettingsContext";

export default function SettingsView() {
  const { yellowLimit, redLimit, setYellowLimit, setRedLimit } = useSettings();

  const [localYellow, setLocalYellow] = useState(yellowLimit);
  const [localRed, setLocalRed] = useState(redLimit);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [projectName, setProjectName] = useState(() => {
    return localStorage.getItem("projectName") || "Snack 66";
  });

  useEffect(() => {
    const storedYellow = localStorage.getItem("yellowLimit");
    const storedRed = localStorage.getItem("redLimit");
    if (storedYellow) setLocalYellow(Number(storedYellow));
    if (storedRed) setLocalRed(Number(storedRed));
  }, []);

  const handleNameSave = () => {
    localStorage.setItem("projectName", projectName);
    window.dispatchEvent(new Event("nameChanged"));
  };

  const handleTimeSave = () => {
    localStorage.setItem("yellowLimit", localYellow.toString());
    localStorage.setItem("redLimit", localRed.toString());
    setYellowLimit(localYellow);
    setRedLimit(localRed);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(logoFile)
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoSave = () => {
    if (previewUrl) {
      localStorage.setItem("customLogo", previewUrl);
      window.dispatchEvent(new Event("logoChanged"));
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Configuración de Tiempos</h2>

      <div className="flex flex-col gap-4">
        <label className="text-lg">
          Tiempo para color amarillo (min):
          <input
            type="number"
            value={localYellow}
            onChange={(e) => setLocalYellow(Number(e.target.value))}
            className="block mt-1 p-2 border rounded w-full"
          />
        </label>

        <label className="text-lg">
          Tiempo para color rojo (min):
          <input
            type="number"
            value={localRed}
            onChange={(e) => setLocalRed(Number(e.target.value))}
            className="block mt-1 p-2 border rounded w-full"
          />
        </label>

        <button
          onClick={handleTimeSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Guardar tiempos
        </button>

        <div>
          <p className="font-semibold">Seleccionar logotipo:</p>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {previewUrl && (
            <div className="mt-2">
              <img src={previewUrl} alt="Previsualización" className="w-20 h-20 object-contain rounded" />
            </div>
          )}
          <button
            onClick={handleLogoSave}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Guardar logotipo
          </button>
        </div>

        <div className="mt-6">
          <label className="text-lg block mb-2">Nombre del Restaurante:</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <button
            onClick={handleNameSave}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Guardar nombre
          </button>
        </div>
      </div>
    </div>
  );
}
