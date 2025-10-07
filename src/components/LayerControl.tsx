"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import "./LayerControl.css"

interface LayerControlProps {
  heatmapVisible: boolean;
  toggleHeatmap: () => void;
  onFetchSectores?: (fechaInicio: string, fechaFin: string) => void;
}

export const LayerControl: React.FC<LayerControlProps> = ({
  heatmapVisible,
  toggleHeatmap,
  onFetchSectores,
}) => {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  // Función CORRECTA para PostgreSQL
  const convertirFechaAPI = (fechaInput: string, esFinDeDia: boolean = false): string => {
    if (!fechaInput) return ""
    
    if (esFinDeDia) {
      // Para fecha fin: hasta el ÚLTIMO momento del día
      return `${fechaInput} 23:59:59.999999`
    }
    // Para fecha inicio: desde el PRIMER momento del día
    return `${fechaInput} 00:00:00.000000`
  }

  // Ejecutar mapa de calor y filtrado
  const handleHeatmapClick = () => {
    toggleHeatmap()
    if (onFetchSectores && fechaInicio && fechaFin) {
      const fechaInicioAPI = convertirFechaAPI(fechaInicio, false)
      const fechaFinAPI = convertirFechaAPI(fechaFin, true) // ← true para fin de día
      console.log("📤 Fechas enviadas a API:", { 
        fechaInicioBD: fechaInicioAPI, 
        fechaFinBD: fechaFinAPI 
      })
      onFetchSectores(fechaInicioAPI, fechaFinAPI)
      } else if (!fechaInicio || !fechaFin) {
        alert("Selecciona ambas fechas antes de aplicar el filtro.")
      }
  }

  return (
    <div className="layer-control-fab-container" ref={menuRef}>
      <button
        className="layer-control-fab"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Mostrar capas"
      >
        {/* Ícono de capas */}
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 4L3 9l9 5 9-5-9-5zm0 7.75L5.5 9.13 12 5.69l6.5 3.44L12 11.75zm0 2.5l9-5v2.18l-9 5-9-5V9.25l9 5z"
            fill="currentColor"
          />
        </svg>
      </button>

      {open && (
        <div className="layer-control-menu">
          <strong>Mapa de calor</strong>

          <div className="layer-control-option" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <label>Desde:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="fecha-input"
            />
          </div>

          <div className="layer-control-option" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <label>Hasta:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="fecha-input"
            />
          </div>

          <div className="layer-control-option" style={{ marginTop: 12 }}>
            <button
              className={`heatmap-toggle-btn${heatmapVisible ? " active" : ""}`}
              onClick={handleHeatmapClick}
              disabled={!fechaInicio || !fechaFin}
              aria-pressed={heatmapVisible}
            >
              Mostrar/Ocultar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}