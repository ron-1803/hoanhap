import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAccessibility } from "../contexts/AccessibilityContext";

// ── Định nghĩa danh mục & Thẻ API OSM ──
const CATEGORIES = [
  { id: "hospital", label: "Bệnh viện", icon: "local_hospital", colorClass: "bg-red-500", textClass: "text-red-700 dark:text-red-400", bgLight: "bg-red-100 dark:bg-red-900/30", tags: '["amenity"="hospital"]' },
  { id: "clinic", label: "Phòng khám", icon: "medical_services", colorClass: "bg-orange-500", textClass: "text-orange-700 dark:text-orange-400", bgLight: "bg-orange-100 dark:bg-orange-900/30", tags: '["amenity"="clinic"]' },
  { id: "rehab", label: "Phục hồi chức năng", icon: "accessibility_new", colorClass: "bg-purple-500", textClass: "text-purple-700 dark:text-purple-400", bgLight: "bg-purple-100 dark:bg-purple-900/30", tags: '["healthcare"="rehabilitation"]' },
  { id: "pharmacy", label: "Nhà thuốc", icon: "local_pharmacy", colorClass: "bg-green-500", textClass: "text-green-700 dark:text-green-400", bgLight: "bg-green-100 dark:bg-green-900/30", tags: '["amenity"="pharmacy"]' },
];

const SEARCH_RADIUS = 5000; // 5 km
const DEFAULT_CENTER = [16.4637, 107.5909]; // Tọa độ trung tâm TP. Huế

// ── Hàm tính khoảng cách Haversine (km) ──
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Fetch dữ liệu thật từ Overpass API ──
async function fetchPOIs(lat, lon) {
  const allTags = CATEGORIES.map((c) => c.tags);
  const query = `
    [out:json][timeout:15];
    (
      ${allTags.map((t) => `node${t}(around:${SEARCH_RADIUS},${lat},${lon});`).join("\n")}
      ${allTags.map((t) => `way${t}(around:${SEARCH_RADIUS},${lat},${lon});`).join("\n")}
    );
    out center body;
  `;
  
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  
  if (!res.ok) throw new Error("Lỗi kết nối Overpass API");
  const data = await res.json();
  return data.elements || [];
}

// Phân loại kết quả API
function classifyElement(el) {
  const tags = el.tags || {};
  if (tags.healthcare === "rehabilitation") return "rehab";
  if (tags.amenity === "hospital") return "hospital";
  if (tags.amenity === "clinic") return "clinic";
  if (tags.amenity === "pharmacy") return "pharmacy";
  return "hospital";
}

// ── Component điều khiển tâm bản đồ ──
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// ── Tạo Icon Marker cho Leaflet ──
const createCustomIcon = (typeObj, isUser = false) => {
  const colorClass = isUser ? "bg-[#00E5FF] text-black border-[#00E5FF]" : (typeObj?.colorClass || "bg-primary text-on-primary border-white");
  const iconName = isUser ? "my_location" : (typeObj?.icon || "location_on");
  const pulseClass = isUser ? "animate-pulse shadow-[#00E5FF]/50 ring-4 ring-[#00E5FF]/30" : "hover:bg-primary-container hover:text-on-primary-container";

  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div class="${colorClass} w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-200 cursor-pointer ${pulseClass}">
             <span class="material-symbols-outlined text-lg font-bold">${iconName}</span>
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT CHÍNH
   ═══════════════════════════════════════════════════════════════════════ */
export default function SupportMapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(14);
  const { state, speakText } = useAccessibility();
  
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);

  // ── Hàm tải dữ liệu POIs ──
  const loadData = useCallback(async (lat, lng) => {
    setIsLoading(true);
    try {
      const elements = await fetchPOIs(lat, lng);
      const parsedLocations = elements.map((el) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        if (!elLat || !elLon) return null;

        const categoryId = classifyElement(el);
        const categoryDef = CATEGORIES.find(c => c.id === categoryId);
        
        return {
          id: el.id,
          name: el.tags?.name || el.tags?.["name:vi"] || categoryDef?.label || "Không rõ tên",
          type: categoryId,
          lat: elLat,
          lng: elLon,
          distance: haversineKm(lat, lng, elLat, elLon),
          address: el.tags?.["addr:full"] || [el.tags?.["addr:housenumber"], el.tags?.["addr:street"]].filter(Boolean).join(", ") || "Chưa cập nhật địa chỉ",
          wheelchair: el.tags?.wheelchair || null
        };
      }).filter(Boolean);

      // Sắp xếp gần nhất lên đầu
      parsedLocations.sort((a, b) => a.distance - b.distance);
      setLocations(parsedLocations);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Tự động lấy vị trí khi mở app ──
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
          loadData(latitude, longitude);
        },
        () => {
          // Từ chối định vị -> Dùng mặc định
          loadData(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      loadData(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
    }
  }, [loadData]);

  // ── Xử lý nút định vị lại ──
  const handleLocateUser = () => {
    if (!("geolocation" in navigator)) return alert("Trình duyệt không hỗ trợ định vị.");
    setIsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setMapZoom(15);
        loadData(latitude, longitude);
      },
      () => {
        setIsLoading(false);
        alert("Không thể lấy vị trí. Vui lòng bật quyền định vị.");
      }
    );
  };

  // ── Lọc danh sách (Local Filter) ──
  const filteredLocations = locations.filter((loc) => {
    const matchesFilter = activeFilter === "all" || loc.type === activeFilter;
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          loc.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* ── LEFT SIDEBAR ── */}
      <div className="w-full lg:w-[400px] bg-surface-container-lowest dark:bg-[#1c1f26] flex flex-col shadow-premium z-10 border-r border-outline-variant/30">
        <div className="p-4 border-b border-outline-variant/50 glass-header z-10 shadow-sm relative">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Bản đồ hỗ trợ tiếp cận</h1>
          <p className="text-xs text-gray-500 mb-4">Dữ liệu thực tế từ OpenStreetMap</p>
          
          {/* Thanh tìm kiếm nội bộ */}
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              placeholder="Lọc theo tên, địa chỉ..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-sm text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all accessibility-focus"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Bộ lọc Danh mục */}
          <div className="flex flex-nowrap lg:flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-bold rounded-full transition-all duration-150 active:scale-95 border-2 accessibility-focus whitespace-nowrap
                ${activeFilter === "all"
                  ? "bg-[#00E5FF] border-[#00E5FF] text-black shadow-md"
                  : "bg-surface-container border-outline-variant text-on-surface-variant dark:bg-tertiary-container dark:border-outline dark:text-tertiary-fixed-dim hover:border-primary"
                }`}
            >
              Tất cả
            </button>
            {CATEGORIES.map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveFilter(filter.id);
                  if (state.screenReader) {
                    speakText(`Đang lọc theo ${filter.label}`);
                  }
                }}
                className={`px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-bold rounded-full transition-all duration-150 active:scale-95 border-2 accessibility-focus whitespace-nowrap
                  ${activeFilter === filter.id
                    ? "bg-[#00E5FF] border-[#00E5FF] text-black shadow-md"
                    : "bg-surface-container border-outline-variant text-on-surface-variant dark:bg-tertiary-container dark:border-outline dark:text-tertiary-fixed-dim hover:border-primary"
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách Địa điểm */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" role="feed" aria-label="Danh sách kết quả địa điểm hỗ trợ">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Tìm thấy {filteredLocations.length} địa điểm trong bán kính 5km
              </p>
              
              {filteredLocations.map((loc) => {
                const catInfo = CATEGORIES.find(c => c.id === loc.type);
                return (
                  <div 
                    key={loc.id} 
                    onClick={() => {
                      setMapCenter([loc.lat, loc.lng]);
                      setMapZoom(17);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setMapCenter([loc.lat, loc.lng]);
                        setMapZoom(17);
                      }
                    }}
                    onFocus={() => {
                      if (state.screenReader) {
                        speakText(`${loc.name}. Khoảng cách ${loc.distance < 1 ? (loc.distance * 1000).toFixed(0) + " mét" : loc.distance.toFixed(1) + " ki-lô-mét"}.`);
                      }
                    }}
                    tabIndex={0}
                    role="article"
                    className="glass-card rounded-xl p-3 cursor-pointer hover:-translate-y-1 transition-all group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      📍 {loc.address}
                    </p>
                    
                    <div className="flex justify-between items-center mt-2.5">
                      <span className={`text-[10px] px-2 py-1 rounded-md font-medium ${catInfo?.bgLight} ${catInfo?.textClass}`}>
                        {catInfo?.label}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {loc.wheelchair === "yes" && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">♿ Tiếp cận xe lăn</span>}
                        {loc.distance && (
                          <span className="text-[11px] font-bold text-primary dark:text-inverse-primary bg-primary/10 px-2 py-0.5 rounded">
                            {loc.distance < 1 ? `${(loc.distance * 1000).toFixed(0)} m` : `${loc.distance.toFixed(1)} km`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredLocations.length === 0 && (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">location_off</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Không tìm thấy địa điểm.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── RIGHT MAP AREA ── */}
      <div className="flex-1 relative bg-gray-200 dark:bg-gray-800 z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          zoomControl={false} 
          className="w-full h-full"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* Marker Vị trí người dùng */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={createCustomIcon(null, true)}>
              <Popup><div className="font-bold text-blue-600 text-center">Vị trí của bạn</div></Popup>
            </Marker>
          )}

          {/* Markers Địa điểm */}
          {!isLoading && filteredLocations.map((loc) => {
            const catInfo = CATEGORIES.find(c => c.id === loc.type);
            return (
              <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={createCustomIcon(catInfo)}>
                <Popup className="rounded-xl">
                  <div className="min-w-[180px]">
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{loc.name}</h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{loc.address}</p>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold flex items-center justify-center gap-1 bg-[#00E5FF] text-black px-3 py-1.5 rounded-lg hover:bg-cyan-300 transition-colors accessibility-focus"
                    >
                      <span className="material-symbols-outlined text-sm">directions</span> Chỉ đường
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Nút điều khiển Map */}
        <div className="absolute right-4 bottom-6 flex flex-col gap-3 z-[1000]">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            aria-label="Phóng to bản đồ"
            className="w-12 h-12 bg-[#00E5FF] text-black border-2 border-[#00E5FF] rounded-xl flex items-center justify-center hover:bg-cyan-300 transition-colors shadow-lg accessibility-focus font-bold"
          >
            <span className="material-symbols-outlined text-2xl">add</span>
          </button>
          
          <button
            onClick={() => mapRef.current?.zoomOut()}
            aria-label="Thu nhỏ bản đồ"
            className="w-12 h-12 bg-[#00E5FF] text-black border-2 border-[#00E5FF] rounded-xl flex items-center justify-center hover:bg-cyan-300 transition-colors shadow-lg accessibility-focus font-bold"
          >
            <span className="material-symbols-outlined text-2xl">remove</span>
          </button>

          <button 
            onClick={handleLocateUser}
            className={`w-12 h-12 rounded-xl shadow-xl flex items-center justify-center transition-all border-2 accessibility-focus ${
              isLoading ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-primary text-on-primary hover:bg-primary-container border-primary"
            }`}
            disabled={isLoading}
            aria-label="Định vị vị trí hiện tại của tôi"
            title="Định vị lại"
          >
            <span className={`material-symbols-outlined text-2xl ${isLoading ? "animate-spin" : ""}`}>
              {isLoading ? "sync" : "my_location"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}