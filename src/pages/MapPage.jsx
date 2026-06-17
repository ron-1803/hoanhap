import { useState, useEffect, useMemo, useRef, useCallback, forwardRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";

// ─── Constants & Hanoi Coordinates ──────────────────────────────────
const HANOI_CENTER = [21.0285, 105.8542];

const LOCATION_CATEGORIES = {
  ALL: "Tất cả",
  REHAB: "Cơ sở phục hồi chức năng",
  SPECIAL_EDUCATION: "Trung tâm giáo dục đặc biệt",
  GOVERNMENT: "Cơ quan nhà nước",
  PARK: "Khu vui chơi tiếp cận",
};

// ─── Mock Accessibility Map Data ────────────────────────────────────
const INITIAL_LOCATIONS = [
  {
    id: "loc-1",
    name: "Bệnh viện Phục hồi chức năng Hà Nội",
    category: LOCATION_CATEGORIES.REHAB,
    icon: "local_hospital",
    lat: 21.0022,
    lng: 105.8016,
    address: "Số 35 Lê Văn Thiêm, Thanh Xuân, Hà Nội",
    phone: "024 3858 2234",
    workingHours: "07:30 - 17:00",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600",
    accessibilityBadges: ["Chứng nhận loại A", "Có đường dốc xe lăn", "Thang máy tiếp cận", "Ngôn ngữ ký hiệu"],
    utilities: ["Dốc xe lăn", "Thang máy", "NN Ký hiệu", "Lối ưu tiên"],
    description: "Cơ sở y tế đầu ngành về phục hồi chức năng và điều trị vật lý trị liệu tại Hà Nội với đội ngũ bác sĩ chuyên khoa sâu và trang thiết bị hiện đại.",
  },
  {
    id: "loc-2",
    name: "Trung tâm Chăm sóc NKT Vì Ngày Mai",
    category: LOCATION_CATEGORIES.SPECIAL_EDUCATION,
    icon: "school",
    lat: 21.0065,
    lng: 105.8362,
    address: "Ngõ 120 Trường Chinh, Đống Đa, Hà Nội",
    phone: "024 3869 2233",
    workingHours: "08:00 - 18:00",
    distance: "3.5 km",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600",
    accessibilityBadges: ["Lối vào bằng phẳng", "Chữ nổi Braille", "Có hỗ trợ viên"],
    utilities: ["Lối vào phẳng", "Chữ Braille", "Hỗ trợ viên", "Lối ưu tiên"],
    description: "Nơi cung cấp các lớp học nghề, can thiệp sớm và giáo dục đặc biệt giúp trẻ em khuyết tật phát triển năng lực cá nhân và hòa nhập xã hội vững vàng.",
  },
  {
    id: "loc-3",
    name: "Sở Lao động - Thương binh & Xã hội Hà Nội",
    category: LOCATION_CATEGORIES.GOVERNMENT,
    icon: "groups",
    lat: 21.0254,
    lng: 105.8239,
    address: "Số 75 Nguyễn Chí Thanh, Láng Hạ, Đống Đa, Hà Nội",
    phone: "024 3773 2434",
    workingHours: "08:00 - 17:00",
    distance: "2.8 km",
    image: "https://images.unsplash.com/photo-1541829019-259276a7f9cd?auto=format&fit=crop&q=80&w=600",
    accessibilityBadges: ["Có đường dốc xe lăn", "Thang máy tiếp cận", "Lối đi ưu tiên"],
    utilities: ["Dốc xe lăn", "Thang máy", "Lối ưu tiên"],
    description: "Cơ quan hành chính tiếp nhận và xử lý hồ sơ trợ cấp, chính sách ưu đãi và cấp thẻ tiếp cận dịch vụ công cộng cho người khuyết tật trên địa bàn thành phố.",
  },
  {
    id: "loc-4",
    name: "Công viên Bách Thảo Hà Nội",
    category: LOCATION_CATEGORIES.PARK,
    icon: "nature_people",
    lat: 21.0423,
    lng: 105.8322,
    address: "Số 3 Hoàng Hoa Thám, Ngọc Hà, Ba Đình, Hà Nội",
    phone: "024 3845 2235",
    workingHours: "05:00 - 22:00",
    distance: "4.2 km",
    image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600",
    accessibilityBadges: ["Lối đi bằng phẳng", "Nhà vệ sinh tiếp cận", "Bãi xe ưu tiên"],
    utilities: ["Lối vào phẳng", "WC tiếp cận", "Ghế nghỉ chân", "Bãi xe ưu tiên"],
    description: "Lá phổi xanh của thủ đô với nhiều đường dạo bằng phẳng, lối vào rộng rãi không bậc thềm và hệ thống chỉ dẫn xúc giác trực quan rất thuận tiện cho xe lăn dạo bộ.",
  },
];

// ─── Custom Map Controller component ─────────────────────────────────
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [center, zoom, map]);
  return null;
}

// ─── Custom CustomMarker Component to inject focus handlers ──────────
function CustomMarker({ location, isActive, onSelect }) {
  const map = useMap();
  const markerRef = useRef(null);
  const { state, speakText } = useAccessibility();

  // Create custom DOM icon containing Material Symbols
  const customIcon = useMemo(() => {
    return L.divIcon({
      className: `custom-div-icon ${isActive ? "animate-marker-bounce" : ""}`,
      html: `
        <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-lg transition-all duration-200 cursor-pointer
          ${isActive
            ? "bg-[#00E5FF] text-black border-[#00E5FF] scale-110 shadow-[#00E5FF]/50 ring-4 ring-[#00E5FF]/30 animate-pulse"
            : "bg-primary text-on-primary border-white hover:bg-primary-container hover:text-on-primary-container"
          }">
          <span class="material-symbols-outlined text-xl font-bold">${location.icon}</span>
        </div>
        <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] mx-auto -mt-[2px]
          ${isActive ? "border-t-[#00E5FF]" : "border-t-primary"}">
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
      popupAnchor: [0, -48],
    });
  }, [location.icon, isActive]);

  // Handle click on marker
  const handleClick = useCallback(() => {
    onSelect(location);
    if (state.screenReader) {
      speakText(`Đang chọn ${location.name}. Khoảng cách ${location.distance}. Địa chỉ ${location.address}`);
    }
  }, [location, onSelect, state.screenReader, speakText]);

  // Set WCAG 2.2 accessibility attributes dynamically to the DOM element
  useEffect(() => {
    const markerElement = markerRef.current?.getElement();
    if (!markerElement) return;

    markerElement.setAttribute("tabindex", "0");
    markerElement.setAttribute("role", "button");
    markerElement.setAttribute("aria-label", `${location.name} - Khoảng cách ${location.distance}. Nhấn Enter để xem thông tin chi tiết.`);

    const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    };

    const handleFocus = () => {
      if (state.screenReader) {
        speakText(`${location.name}, ${location.category}, khoảng cách ${location.distance}. Nhấn Enter để xem chi tiết.`);
      }
    };

    markerElement.addEventListener("keydown", handleKeyDown);
    markerElement.addEventListener("focus", handleFocus);

    return () => {
      markerElement.removeEventListener("keydown", handleKeyDown);
      markerElement.removeEventListener("focus", handleFocus);
    };
  }, [location, handleClick, state.screenReader, speakText]);

  // Native Leaflet Marker component handles events
  return (
    <div key={location.id}>
      <span className="sr-only">{location.name}</span>
      <LMarkerContainer
        ref={markerRef}
        position={[location.lat, location.lng]}
        icon={customIcon}
        eventHandlers={{
          click: handleClick,
        }}
      />
    </div>
  );
}

// Wrapper for leaflet Marker to bypass React 19 forwardRef wrapper warnings if any
const LMarkerContainer = forwardRef(({ position, icon, eventHandlers }, ref) => {
  return <Marker ref={ref} position={position} icon={icon} eventHandlers={eventHandlers} />;
});

// Helper to calculate distance between two coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export default function MapPage() {
  const { state, speakText } = useAccessibility();
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "locations"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setLocations(list);
    });
    return unsubscribe;
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [activeLocation, setActiveLocation] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [mapCenter, setMapCenter] = useState(HANOI_CENTER);
  const [showDirections, setShowDirections] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mobileView, setMobileView] = useState("map"); // "map" or "list"

  // Focus trap for Directions/Details Overlay
  const overlayRef = useRef(null);

  // Determine dynamic map theme based on accessibility states
  const mapTileUrl = useMemo(() => {
    if (state.darkMode || state.highContrast) {
      return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }
    return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  }, [state.darkMode, state.highContrast]);

  const mapAttribution = useMemo(() => {
    if (state.darkMode || state.highContrast) {
      return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    }
    return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  }, [state.darkMode, state.highContrast]);

  // Geolocation handling (Gần tôi)
  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị GPS.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        
        // Calculate dynamic distances from user location
        const locationsWithGeo = locations.map((loc) => {
          const dist = calculateDistance(latitude, longitude, loc.lat, loc.lng);
          return {
            ...loc,
            distance: `${dist} km`,
            distanceValue: parseFloat(dist),
          };
        });

        // Sort by closest distance
        locationsWithGeo.sort((a, b) => a.distanceValue - b.distanceValue);
        setLocations(locationsWithGeo);

        // Center on the closest location
        const closest = locationsWithGeo[0];
        setMapCenter([closest.lat, closest.lng]);
        setMapZoom(14);
        setActiveLocation(closest);

        if (state.screenReader) {
          speakText(`Đã định vị thành công. Địa điểm gần bạn nhất là ${closest.name}, cách khoảng ${closest.distance}`);
        }
      },
      (error) => {
        console.error("Lỗi định vị:", error);
        alert("Không thể truy cập tọa độ GPS của bạn. Vui lòng cho phép quyền truy cập vị trí.");
      }
    );
  }, [locations, state.screenReader, speakText]);

  // Filter locations by search query and category
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesSearch =
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "Tất cả" || loc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [locations, searchQuery, selectedCategory]);

  // Pan and select location from sidebar card
  const handleSelectLocation = useCallback(
    (loc) => {
      setActiveLocation(loc);
      setMapCenter([loc.lat, loc.lng]);
      setMapZoom(15);
      setShowDirections(false);
      setMobileView("map");

      if (state.screenReader) {
        speakText(`Đã hiển thị thông tin ${loc.name}. Địa chỉ: ${loc.address}. Trạng thái hoạt động: ${loc.workingHours}.`);
      }
    },
    [state.screenReader, speakText]
  );

  // Custom Zoom Control Helpers
  const mapRefForControls = useRef(null);

  // Invalidate Leaflet map size when mobile view switches to map
  useEffect(() => {
    if (mobileView === "map" && mapRefForControls.current) {
      const timer = setTimeout(() => {
        mapRefForControls.current.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mobileView]);

  const handleZoomIn = () => {
    const map = mapRefForControls.current;
    if (map) {
      map.zoomIn();
      setMapZoom(map.getZoom());
    }
  };
  const handleZoomOut = () => {
    const map = mapRefForControls.current;
    if (map) {
      map.zoomOut();
      setMapZoom(map.getZoom());
    }
  };

  // Close Detail Overlay
  const handleCloseOverlay = () => {
    setActiveLocation(null);
    setShowDirections(false);
  };

  return (
    <div
      role="application"
      aria-label="Bản đồ tương tác các địa điểm hỗ trợ tiếp cận"
      className="flex flex-col h-[calc(100vh-80px)] w-full bg-background dark:bg-tertiary/20 theme-transition overflow-hidden"
    >
      {/* ─── Top Filter panel ─── */}
      <div className="w-full bg-surface dark:bg-tertiary border-b border-outline-variant dark:border-outline px-3 py-2 lg:px-6 lg:py-4 flex flex-col gap-2 lg:gap-4 z-10 theme-transition shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 lg:gap-4">
          <div>
            <h1 className="font-headline-lg text-lg lg:text-2xl md:text-3xl font-extrabold text-primary dark:text-inverse-primary">
              Bản đồ hỗ trợ tiếp cận
            </h1>
            <p className="hidden lg:block text-sm md:text-base text-on-surface-variant dark:text-tertiary-fixed-dim mt-1">
              Tìm kiếm cơ sở y tế, trung tâm phục hồi chức năng và địa điểm hỗ trợ tiếp cận gần bạn.
            </p>
          </div>

          {/* Quick Search controls */}
          <div className="flex items-center gap-2 max-w-lg w-full">
            <div className="relative flex-grow">
              <span className="material-symbols-outlined absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-outline" aria-hidden="true">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập địa điểm hoặc tên cơ sở..."
                aria-label="Tìm kiếm địa điểm trên bản đồ"
                className="w-full pl-10 lg:pl-11 pr-4 h-10 lg:h-12 rounded-xl border-2 border-outline-variant dark:border-outline focus:border-primary bg-surface-container-lowest dark:bg-tertiary text-on-surface dark:text-inverse-on-surface text-sm"
              />
            </div>
            
            <Button
              variant="secondary"
              onClick={handleNearMe}
              icon="my_location"
              className="h-10 lg:h-12 px-3 lg:px-4 rounded-xl flex items-center justify-center font-bold text-sm text-nowrap gap-1 border-2 border-primary"
            >
              Gần tôi
            </Button>
          </div>
        </div>

        {/* Filter Chips row */}
        <div
          role="tablist"
          aria-label="Lọc địa điểm theo loại hình"
          className="flex flex-nowrap lg:flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          {Object.values(LOCATION_CATEGORIES).map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setSelectedCategory(cat);
                  if (state.screenReader) {
                    speakText(`Đang lọc theo ${cat}`);
                  }
                }}
                className={`px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-bold rounded-full transition-all duration-150 active:scale-95 border-2 accessibility-focus whitespace-nowrap
                  ${isActive
                    ? "bg-[#00E5FF] border-[#00E5FF] text-black"
                    : "bg-surface-container border-outline-variant text-on-surface-variant dark:bg-tertiary-container dark:border-outline dark:text-tertiary-fixed-dim hover:border-primary"
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Split Layout Viewport ─── */}
      <div className="flex flex-1 w-full relative overflow-hidden">
        {/* Left Location List (450px wide) */}
        <div className={`w-full lg:w-[450px] max-w-full flex-shrink-0 bg-surface dark:bg-tertiary border-r-2 border-outline-variant dark:border-outline flex flex-col h-full theme-transition z-10 ${mobileView === "list" ? "flex" : "hidden lg:flex"}`}>
          <div className="px-4 py-3 bg-surface-container dark:bg-tertiary-container/30 border-b border-outline-variant/30 flex justify-between items-center">
            <span className="text-sm font-bold text-on-surface dark:text-inverse-on-surface">
              Tìm thấy {filteredLocations.length} kết quả
            </span>
            <button
              onClick={() => {
                setLocations([...locations].reverse());
                if (state.screenReader) speakText("Đã đảo ngược thứ tự danh sách.");
              }}
              className="text-xs font-bold text-primary dark:text-inverse-primary hover:underline flex items-center gap-1 accessibility-focus"
            >
              <Icon name="sort" size="text-sm" />
              Sắp xếp
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            role="feed"
            aria-label="Danh sách kết quả địa điểm hỗ trợ"
          >
            {filteredLocations.map((loc) => {
              const isActive = activeLocation?.id === loc.id;
              return (
                <div
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectLocation(loc);
                    }
                  }}
                  onFocus={() => {
                    if (state.screenReader) {
                      speakText(`${loc.name}, khoảng cách ${loc.distance}. Trạng thái: ${loc.workingHours}.`);
                    }
                  }}
                  tabIndex={0}
                  role="article"
                  aria-label={`${loc.name}. ${loc.category}. Khoảng cách ${loc.distance}. Trạng thái hoạt động ${loc.workingHours}`}
                  className={`group border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 shadow-sm theme-transition focus-visible:ring-4 focus-visible:ring-primary
                    ${isActive
                      ? "bg-primary-fixed border-primary dark:bg-on-primary-fixed-variant dark:border-inverse-primary"
                      : "bg-surface-container-lowest border-outline-variant dark:bg-tertiary dark:border-outline hover:border-primary"
                    }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-on-primary' : 'bg-primary-fixed text-primary'}`}>
                        <Icon name={loc.icon} size="text-lg" />
                      </div>
                      <h2 className="font-bold text-base text-on-surface dark:text-inverse-on-surface leading-snug group-hover:text-primary dark:group-hover:text-inverse-primary truncate max-w-[240px]">
                        {loc.name}
                      </h2>
                    </div>
                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary dark:bg-inverse-primary/20 dark:text-inverse-primary text-xs font-bold rounded-full flex items-center gap-0.5 whitespace-nowrap">
                      <Icon name="directions_walk" size="text-xs" />
                      {loc.distance}
                    </span>
                  </div>

                  <p className="text-xs text-outline dark:text-tertiary-fixed-dim flex items-center gap-1 mb-2">
                    <Icon name="location_on" size="text-sm" />
                    <span className="truncate">{loc.address}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3 text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                      <Icon name="schedule" size="text-sm" />
                      Đang mở cửa
                    </span>
                    <span className="text-on-surface-variant dark:text-tertiary-fixed-dim opacity-70">
                      • {loc.workingHours}
                    </span>
                    {loc.phone && (
                      <span className="text-on-surface-variant dark:text-tertiary-fixed-dim flex items-center gap-0.5">
                        <Icon name="phone" size="text-sm" />
                        {loc.phone}
                      </span>
                    )}
                  </div>

                  {/* Accessibility feature badges */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-outline-variant/30">
                    {loc.accessibilityBadges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed dark:bg-on-secondary-fixed-variant dark:text-secondary-fixed text-[10px] font-bold rounded-md uppercase tracking-wider"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredLocations.length === 0 && (
              <div className="text-center py-12 px-4">
                <Icon name="map_search" size="text-4xl" className="text-outline mb-2" />
                <h3 className="font-bold text-sm text-on-surface dark:text-inverse-on-surface">Không tìm thấy địa điểm</h3>
                <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mt-1">
                  Thử tìm kiếm với từ khóa khác hoặc chuyển danh mục bộ lọc.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Leaflet Map Viewport */}
        <div className={`flex-grow h-full relative ${mobileView === "map" ? "block" : "hidden lg:block"}`} aria-hidden="true">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            zoomControl={false}
            keyboard={false} // Disable Leaflet default keyboard nav to avoid interference
            className="w-full h-full"
            ref={mapRefForControls}
          >
            <TileLayer url={mapTileUrl} attribution={mapAttribution} />

            {/* Custom map controller to sync react state with Leaflet map view */}
            <MapController center={mapCenter} zoom={mapZoom} />

            {/* Render Custom Accessibility Markers */}
            {filteredLocations.map((loc) => {
              const isActive = activeLocation?.id === loc.id;
              return (
                <CustomMarker
                  key={loc.id}
                  location={loc}
                  isActive={isActive}
                  onSelect={handleSelectLocation}
                />
              );
            })}
          </MapContainer>

          {/* Custom Zoom & Location controls on bottom right */}
          <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-[999]">
            <button
              onClick={handleZoomIn}
              aria-label="Phóng to bản đồ"
              className="w-12 h-12 bg-[#00E5FF] text-black border-2 border-[#00E5FF] rounded-xl flex items-center justify-center hover:bg-cyan-300 transition-colors shadow-lg accessibility-focus font-bold"
            >
              <Icon name="add" size="text-2xl" />
            </button>
            
            <button
              onClick={handleZoomOut}
              aria-label="Thu nhỏ bản đồ"
              className="w-12 h-12 bg-[#00E5FF] text-black border-2 border-[#00E5FF] rounded-xl flex items-center justify-center hover:bg-cyan-300 transition-colors shadow-lg accessibility-focus font-bold"
            >
              <Icon name="remove" size="text-2xl" />
            </button>

            <button
              onClick={handleNearMe}
              aria-label="Định vị vị trí hiện tại của tôi"
              className="w-12 h-12 bg-primary text-on-primary border-2 border-primary rounded-xl flex items-center justify-center hover:bg-primary-container transition-colors shadow-lg accessibility-focus"
            >
              <Icon name="my_location" size="text-2xl" />
            </button>
          </div>

          {/* Floating Details Overlay Card (Details / Route Directions) */}
          {activeLocation && (
            <div
              ref={overlayRef}
              className="absolute left-1/2 -translate-x-1/2 top-4 lg:left-6 lg:translate-x-0 lg:top-6 z-[1000] w-[400px] max-w-[calc(100%-32px)] lg:max-w-[calc(100%-48px)] max-h-[calc(100%-80px)] overflow-y-auto bg-surface dark:bg-tertiary border-2 border-outline dark:border-outline-variant rounded-2xl shadow-2xl animate-[slideUp_0.25s_ease-out] theme-transition"
            >
              {/* Card Header (Close button & image) */}
              <div className="relative h-44 w-full bg-slate-200">
                <img
                  src={activeLocation.image}
                  alt={`Ảnh chụp ${activeLocation.name}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleCloseOverlay}
                  aria-label="Đóng bảng thông tin chi tiết địa điểm"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center transition-colors accessibility-focus"
                >
                  <Icon name="close" size="text-lg" />
                </button>
              </div>

              {/* Card Content */}
              <div className="p-5 flex flex-col gap-4 text-on-surface dark:text-inverse-on-surface">
                <div>
                  <h3 className="font-headline-md text-lg font-bold text-primary dark:text-inverse-primary leading-tight mb-1">
                    {activeLocation.name}
                  </h3>
                  <p className="text-xs text-outline dark:text-tertiary-fixed-dim flex items-center gap-1">
                    <Icon name="location_on" size="text-sm" />
                    {activeLocation.address}
                  </p>
                </div>

                {/* Info Badges & Details */}
                <div className="bg-surface-container dark:bg-tertiary-container/30 border border-outline-variant/30 rounded-xl p-3.5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Danh mục:</span>
                    <span>{activeLocation.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Giờ làm việc:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {activeLocation.workingHours} (Đang mở)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold">Đường dây nóng:</span>
                    <a href={`tel:${activeLocation.phone}`} className="underline font-bold text-primary dark:text-inverse-primary accessibility-focus">
                      {activeLocation.phone}
                    </a>
                  </div>

                  <p className="text-[11px] leading-relaxed border-t border-outline-variant/30 pt-2 text-on-surface-variant dark:text-tertiary-fixed-dim">
                    {activeLocation.description}
                  </p>
                </div>

                {/* Specific utility checkers (badging lists) */}
                <div>
                  <h4 className="text-xs font-bold mb-2 uppercase tracking-wider text-outline dark:text-tertiary-fixed-dim">
                    Tiện ích hỗ trợ tiếp cận
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {activeLocation.utilities.map((util, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 py-1 px-2.5 bg-surface-container-low dark:bg-tertiary-container/20 rounded-lg">
                        <Icon name="check_circle" size="text-sm" className="text-emerald-600 dark:text-emerald-400" />
                        <span>{util}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex gap-2.5 border-t border-outline-variant/30 pt-4">
                  <Button
                    variant={showDirections ? "secondary" : "primary"}
                    onClick={() => {
                      setShowDirections((prev) => !prev);
                      if (state.screenReader) {
                        speakText(showDirections ? "Đã tắt hướng dẫn đường đi" : "Đã kích hoạt hướng dẫn đường đi chi tiết");
                      }
                    }}
                    icon="directions"
                    className="flex-grow font-bold text-sm h-11"
                  >
                    {showDirections ? "Ẩn chỉ đường" : "Chỉ đường"}
                  </Button>

                  <button
                    aria-label="Lưu địa điểm này"
                    className="w-11 h-11 border-2 border-outline-variant dark:border-outline text-on-surface-variant dark:text-tertiary-fixed-dim rounded-xl flex items-center justify-center hover:bg-surface-container-high transition-colors accessibility-focus"
                  >
                    <Icon name="bookmark" />
                  </button>

                  <button
                    aria-label="Chia sẻ địa điểm"
                    className="w-11 h-11 border-2 border-outline-variant dark:border-outline text-on-surface-variant dark:text-tertiary-fixed-dim rounded-xl flex items-center justify-center hover:bg-surface-container-high transition-colors accessibility-focus"
                  >
                    <Icon name="share" />
                  </button>
                </div>

                {/* Directions Details section */}
                {showDirections && (
                  <div className="mt-2 border-t border-outline-variant/30 pt-3 space-y-3 animate-[slideUp_0.15s_ease-out]">
                    <h4 className="text-xs font-bold text-primary dark:text-inverse-primary uppercase tracking-wider flex items-center gap-1">
                      <Icon name="navigation" size="text-sm" />
                      Hướng dẫn lộ trình tiếp cận
                    </h4>
                    
                    <div className="text-xs space-y-2 max-h-40 overflow-y-auto pr-1">
                      <div className="flex gap-2 items-start border-l-2 border-primary/30 pl-3 py-1">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary dark:bg-inverse-primary/20 dark:text-inverse-primary text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                        <p>Từ vị trí hiện tại của bạn, di chuyển theo hướng Tây Nam về phía trục đường giao thông chính.</p>
                      </div>

                      <div className="flex gap-2 items-start border-l-2 border-primary/30 pl-3 py-1">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary dark:bg-inverse-primary/20 dark:text-inverse-primary text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                        <p>Đi qua nút giao thứ nhất, làn đường dành riêng cho xe lăn nằm phía bên phải vỉa hè rộng rãi.</p>
                      </div>

                      <div className="flex gap-2 items-start border-l-2 border-primary/30 pl-3 py-1">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary dark:bg-inverse-primary/20 dark:text-inverse-primary text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                        <p>Đi tiếp 500m nữa. Điểm đến nằm phía bên tay phải, lối đi có dốc thoải 6% dành riêng cho xe lăn và tay vịn hỗ trợ.</p>
                      </div>
                    </div>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${activeLocation.lat},${activeLocation.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-10 bg-secondary text-on-secondary rounded-xl flex items-center justify-center font-bold text-xs hover:bg-secondary-container transition-colors accessibility-focus"
                    >
                      Mở Google Bản đồ
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Floating Mobile Toggle Button */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] lg:hidden">
          <button
            onClick={() => setMobileView((prev) => (prev === "map" ? "list" : "map"))}
            className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 transition-all active:scale-95 border-2 border-primary-container"
          >
            <Icon name={mobileView === "map" ? "list" : "map"} size="text-lg" />
            <span>{mobileView === "map" ? "Xem danh sách" : "Xem bản đồ"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
