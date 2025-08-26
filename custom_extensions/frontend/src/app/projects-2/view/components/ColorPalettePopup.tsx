import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, Box, Slider, Typography, TextField } from '@mui/material';

type ColorFormat = 'HEX' | 'RGBA' | 'HSLA';

interface RGBA { r: number; g: number; b: number; a: number; }
interface HSLA { h: number; s: number; l: number; a: number; }

interface ColorPalettePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect?: (hex: string) => void;
  recentColors?: string[];
}

const ColorPalettePopup: React.FC<ColorPalettePopupProps> = ({
  isOpen,
  onClose,
  onColorSelect,
  recentColors: initialRecentColors = [],
}) => {
  // States
  const [hsb, setHsb] = useState({ h: 0, s: 100, b: 100 });
  const [opacity, setOpacity] = useState(1);
  const [hex, setHex] = useState('#ff0000');
  const [rgba, setRgba] = useState<RGBA>({ r: 255, g: 0, b: 0, a: 1 });
  const [hsla, setHsla] = useState<HSLA>({ h: 0, s: 100, l: 50, a: 1 });
  const [colorFormat, setColorFormat] = useState<ColorFormat>('HEX');
  const [recentColors, setRecentColors] = useState(initialRecentColors);
  const [isTyping, setIsTyping] = useState(false);

  const sbRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  /** --- Utility functions for conversions --- **/
  const hsbaToHex = (h: number, s: number, b: number, a: number) => {
    // Convert HSB to RGB first
    const sat = s / 100, bri = b / 100;
    const k = (n: number) => (n + h / 60) % 6;
    const f = (n: number) => bri * (1 - sat * Math.max(Math.min(k(n), 4 - k(n), 1), 0));
    const r = Math.round(f(5) * 255);
    const g = Math.round(f(3) * 255);
    const bVal = Math.round(f(1) * 255);
    const hexVal = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bVal.toString(16).padStart(2, '0')}`;
    return hexVal;
  };

  const hexToRgba = (hex: string): RGBA => {
    const match = hex.replace('#','').match(/.{2}/g);
    if (!match) return { r: 0, g: 0, b: 0, a: 1 };
    return { r: parseInt(match[0],16), g: parseInt(match[1],16), b: parseInt(match[2],16), a: opacity };
  };

  const hexToHsla = (hex: string): HSLA => {
    const { r, g, b } = hexToRgba(hex);
    const r1 = r/255, g1 = g/255, b1 = b/255;
    const max = Math.max(r1,g1,b1), min = Math.min(r1,g1,b1);
    let h=0, s=0, l=(max+min)/2;
    if(max!==min){
      const d = max-min;
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r1: h = (g1-b1)/d + (g1<b1?6:0); break;
        case g1: h = (b1-r1)/d + 2; break;
        case b1: h = (r1-g1)/d + 4; break;
      }
      h *= 60;
    }
    return { h, s: s*100, l: l*100, a: opacity };
  };

  /** --- Commit color to recents & parent --- **/
  const commitColor = (newHex?: string) => {
    const hexValue = newHex || hsbaToHex(hsb.h, hsb.s, hsb.b, opacity);
    setRecentColors(prev => [hexValue, ...prev.filter(c => c !== hexValue)].slice(0,5));
    setHex(hexValue);
    setRgba(hexToRgba(hexValue));
    setHsla(hexToHsla(hexValue));
    onColorSelect?.(hexValue);
    setIsTyping(false);
  };

  /** --- Slider handlers --- **/
  const handleHueChange = (_: Event, value: number | number[]) => {
    const h = Array.isArray(value)? value[0] : value;
    setHsb(prev => ({ ...prev, h }));
  };
  const handleHueCommit = () => commitColor();

  const handleOpacityChange = (_: Event, value: number | number[]) => {
    const op = Array.isArray(value)? value[0] : value;
    setOpacity(op);
  };
  const handleOpacityCommit = () => commitColor();

  /** --- Saturation/Brightness --- **/
  const handleSaturationMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    handleSaturationMove(e);
    window.addEventListener('mousemove', handleSaturationMove);
    window.addEventListener('mouseup', handleSaturationMouseUp);
  };
  const handleSaturationMove = (e: MouseEvent | React.MouseEvent) => {
    if(!sbRef.current) return;
    const rect = sbRef.current.getBoundingClientRect();
    const s = Math.min(Math.max((e.clientX - rect.left)/rect.width*100,0),100);
    const b = Math.min(Math.max((1-(e.clientY-rect.top)/rect.height)*100,0),100);
    setHsb(prev=>({ ...prev, s, b }));
  };
  const handleSaturationMouseUp = () => {
    isDragging.current = false;
    commitColor();
    window.removeEventListener('mousemove', handleSaturationMove);
    window.removeEventListener('mouseup', handleSaturationMouseUp);
  };

  /** --- HEX Input --- **/
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHex(e.target.value);
    setIsTyping(true);
  };
  const handleHexCommit = () => commitColor(hex);

  /** --- RGBA Input --- **/
  const handleRgbaChange = (field: keyof RGBA) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setRgba(prev=>({...prev, [field]: isNaN(val)?0:val}));
    setIsTyping(true);
  };
  const handleRgbaCommit = () => {
    const hexVal = `#${Math.round(rgba.r).toString(16).padStart(2,'0')}${Math.round(rgba.g).toString(16).padStart(2,'0')}${Math.round(rgba.b).toString(16).padStart(2,'0')}`;
    setOpacity(rgba.a);
    commitColor(hexVal);
  };

  /** --- HSLA Input --- **/
  const handleHslaChange = (field: keyof HSLA) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setHsla(prev=>({...prev, [field]: isNaN(val)?0:val}));
    setIsTyping(true);
  };
  const handleHslaCommit = () => {
    const hexVal = hsbaToHex(hsla.h, hsla.s, hsla.l, hsla.a);
    setOpacity(hsla.a);
    commitColor(hexVal);
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContent>
        {/* Hue Slider */}
        <Box>
          <Slider min={0} max={360} value={hsb.h} onChange={handleHueChange} onMouseUp={handleHueCommit} onTouchEnd={handleHueCommit}/>
        </Box>

        {/* Opacity Slider */}
        <Box mt={2}>
          <Slider min={0} max={1} step={0.01} value={opacity} onChange={handleOpacityChange} onMouseUp={handleOpacityCommit} onTouchEnd={handleOpacityCommit}/>
        </Box>

        {/* Saturation/Brightness */}
        <Box ref={sbRef} onMouseDown={handleSaturationMouseDown} sx={{ width:'100%', height:128, background:`linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(${hsb.h},100%,50%))`, mt:2, cursor:'crosshair'}}>
          <Box sx={{ position:'absolute', left:`${hsb.s}%`, top:`${100-hsb.b}%`, width:12, height:12, border:'2px solid #000', borderRadius:'50%', transform:'translate(-50%,-50%)', backgroundColor:'#fff'}}/>
        </Box>

        {/* Color Format Inputs */}
        {colorFormat==='HEX' && <TextField label="HEX" value={hex} onChange={handleHexChange} onBlur={handleHexCommit} onKeyDown={e=>e.key==='Enter'&&handleHexCommit()} fullWidth sx={{mt:2}} />}
        {colorFormat==='RGBA' && <Box mt={2} display="flex" gap={1}>
          {['r','g','b','a'].map((f)=>(
            <TextField key={f} label={f.toUpperCase()} type="number" value={(rgba as any)[f]} onChange={handleRgbaChange(f as keyof RGBA)} onBlur={handleRgbaCommit} onKeyDown={e=>e.key==='Enter'&&handleRgbaCommit()} sx={{flex:1}} />
          ))}
        </Box>}
        {colorFormat==='HSLA' && <Box mt={2} display="flex" gap={1}>
          {['h','s','l','a'].map((f)=>(
            <TextField key={f} label={f.toUpperCase()} type="number" value={(hsla as any)[f]} onChange={handleHslaChange(f as keyof HSLA)} onBlur={handleHslaCommit} onKeyDown={e=>e.key==='Enter'&&handleHslaCommit()} sx={{flex:1}} />
          ))}
        </Box>}

        {/* Color Preview */}
        <Box mt={2} width={40} height={40} sx={{ backgroundColor:hex, border:'1px solid #ccc', borderRadius:2 }}/>

        {/* Recent Colors */}
        <Box mt={2} display="flex" gap={1}>
          {recentColors.map((color,i)=>(
            <Box key={i} sx={{width:24,height:24,backgroundColor:color,border:'1px solid #ccc',cursor:'pointer'}} onClick={()=>commitColor(color)}/>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ColorPalettePopup;
