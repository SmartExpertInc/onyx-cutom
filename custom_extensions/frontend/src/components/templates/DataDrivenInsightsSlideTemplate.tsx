// custom_extensions/frontend/src/components/templates/DataDrivenInsightsSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface DataDrivenInsightsProps extends BaseTemplateProps {
  tag: string;
  title: string;
  description: string;
  leftChartTitle: string;
  rightChartTitle: string;
  leftBars: number[]; // heights 0-100
  rightBars: number[];
  barLabels: string[]; // years labels shared
  leftValues?: string[]; // labels above bars
  rightValues?: string[];
  yTicks?: number[]; // e.g., [20,40,60,80]
  metrics: Array<{ value: string; caption: string }>;
  avatarPath?: string;
}

export const DataDrivenInsightsSlideTemplate: React.FC<DataDrivenInsightsProps & { theme?: SlideTheme | string }> = ({
  tag = 'Statistics',
  title = 'Data-Driven Insights: Statistics and Trends',
  description = 'Provide statistics about the market size to show the potential for growth. Share how many customers your company has acquired to date. Share product performance statistics to show how your product compares to competitors, etc.',
  leftChartTitle = 'The global market for XYZ product is estimated to reach $XX billion by 2025, growing at a CAGR of XX% from 2020 to 2025',
  rightChartTitle = 'Our product has a 4.8-star rating on the App Store and a 95% customer satisfaction score based on user surveys.',
  leftBars = [33,39,55,44,67],
  rightBars = [33,39,55,44,67],
  barLabels = ['2017','2018','2019','2020','2021'],
  leftValues = ['33M','39M','55M','44M','67M'],
  rightValues = ['33M','39M','55M','44M','67M'],
  yTicks = [20,40,60,80],
  metrics = [
    { value: '+XM', caption: 'customers since our launch in 2016' },
    { value: '$XXM', caption: 'reaching in total revenue for 2020' },
    { value: 'XM', caption: 'active users who spend an average of 30 minutes per day using our product.' }
  ],
  avatarPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [edit, setEdit] = useState<{ key: string } | null>(null);

  type SeriesBar = { year: string; value: string; height: number };
  const toSeries = (heights: number[], values: string[], years: string[]): SeriesBar[] => {
    const len = Math.max(heights.length, values.length, years.length);
    return Array.from({ length: len }).map((_, i) => ({
      year: years[i] ?? String(2000 + i),
      value: values[i] ?? '',
      height: Math.max(0, heights[i] ?? 0),
    }));
  };
  const [leftSeries, setLeftSeries] = useState<SeriesBar[]>(toSeries(leftBars, leftValues, barLabels));
  const [rightSeries, setRightSeries] = useState<SeriesBar[]>(toSeries(rightBars, rightValues, barLabels));
  const [hoverPanel, setHoverPanel] = useState<'left'|'right'|null>(null);
  const [hoverBar, setHoverBar] = useState<{ panel: 'left'|'right'; idx: number } | null>(null);
  const [currentYTicks, setCurrentYTicks] = useState<number[]>(yTicks);

  const pushState = (panel: 'left'|'right') => {
    if (!onUpdate) return;
    if (panel === 'left') {
      onUpdate({
        leftBars: leftSeries.map(b => b.height),
        leftValues: leftSeries.map(b => b.value),
        barLabels: leftSeries.map(b => b.year),
      });
    } else {
      onUpdate({
        rightBars: rightSeries.map(b => b.height),
        rightValues: rightSeries.map(b => b.value),
      });
    }
  };

  // Layout
  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#1A1A1A', color:'#E5E7EB', fontFamily: 'Lora-Bold, serif', fontWeight: 'normal', position:'relative' };
  const tagStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'40px', background:'#282828', color:'#9B9B9B', padding:'8px 18px', fontSize:'16px' };
  const titleStyle: React.CSSProperties = { fontSize:'38px', fontFamily: 'Lora-Bold, serif', fontWeight: 'normal', color:'#D2D2D2' };
  const descStyle: React.CSSProperties = { width:'795px', color:'#909090', fontSize:'14px' };
  // wrappers to prevent layout shift on edit
  const titleWrap: React.CSSProperties = { position:'absolute', left:'40px', top:'90px', right:'480px', width:'780px', minHeight:'50px' };
  const descWrap: React.CSSProperties = { position:'absolute', left:'40px', top:'160px', right:'480px', minHeight:'46px' };

  const chartsWrap: React.CSSProperties = { position:'absolute', left:'40px', top:'270px', width:'725px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' };
  const panel: React.CSSProperties = { background:'#29282A', height:'338px', padding:'16px 18px', borderRadius:'2px', position:'relative' };
  const chartArea: React.CSSProperties = { position:'relative', height:'220px', padding:'16px 18px 8px 0' };
  const barsRow: React.CSSProperties = { position:'absolute', left:'54px', right:'18px', bottom:'8px', display:'flex', alignItems:'flex-end', gap:'10px', height:'calc(100% - 24px)' };
  const yAxis: React.CSSProperties = { position:'absolute', left:0, top:'16px', bottom:'8px', width:'54px', color:'#9C9C9C', fontSize:'12px' };
  const barBase: React.CSSProperties = { width:'40px', background:'#894DF4', position:'relative' };
  const yearRow: React.CSSProperties = { display:'flex', justifyContent:'flex-start', padding:'0 18px 0 54px', color:'#AAA9A7', fontSize:'12px', gap:'10px' };

  const rightMetrics: React.CSSProperties = { position:'absolute', right:'0', top:'260px', width:'385px', display:'grid', rowGap:'15px' };
  const metricValue: React.CSSProperties = { fontSize:'38px', fontFamily: 'Lora-Bold, serif', fontWeight: 'normal', color:'#DBDBDB' };
  const metricCaption: React.CSSProperties = { marginTop:'6px', width:'270px', color:'#929292', fontSize:'15px' };
  const avatar: React.CSSProperties = { position:'absolute', right:'64px', top:'72px', width:'120px', height:'120px', borderRadius:'50%', overflow:'hidden', background:'#1F2125' };

  const inlineStable = (base: React.CSSProperties): React.CSSProperties => ({ ...base, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0, whiteSpace:'pre-wrap' });

  const renderBars = (panelKey: 'left'|'right', series: SeriesBar[]) => (
    <div style={chartArea}>
      <div style={yAxis}>
        <div style={{ position:'absolute', left:0, bottom:0, cursor: isEditable ? 'pointer':'default' }} onClick={()=> isEditable && setEdit({ key: `${panelKey}-y-0` })}>
          {edit?.key===`${panelKey}-y-0` ? (
            <ImprovedInlineEditor initialValue="0" onSave={(v)=>{ const num = parseInt(v) || 0; setCurrentYTicks([num, ...currentYTicks]); onUpdate && onUpdate({ yTicks: [num, ...currentYTicks] }); setEdit(null); }} onCancel={()=> setEdit(null)} style={{ background:'transparent', border:'none', outline:'none', color:'#9C9C9C', fontSize:'12px' }} />
          ) : '0'}
        </div>
        {currentYTicks.map((t, i)=> (
          <div key={t} style={{ position:'absolute', left:0, bottom:`${t*2}px`, cursor: isEditable ? 'pointer':'default' }} onClick={()=> isEditable && setEdit({ key: `${panelKey}-y-${i+1}` })}>
            {edit?.key===`${panelKey}-y-${i+1}` ? (
              <ImprovedInlineEditor initialValue={t.toString()} onSave={(v)=>{ const num = parseInt(v) || 0; const next = [...currentYTicks]; next[i] = num; setCurrentYTicks(next); onUpdate && onUpdate({ yTicks: next }); setEdit(null); }} onCancel={()=> setEdit(null)} style={{ background:'transparent', border:'none', outline:'none', color:'#9C9C9C', fontSize:'12px' }} />
            ) : t}
          </div>
        ))}
      </div>
      <div style={barsRow} onMouseEnter={()=> setHoverPanel(panelKey)} onMouseLeave={()=> { setHoverPanel(null); setHoverBar(null); }}>
        {series.map((b, i)=> {
          const hh = Math.max(0, Math.min(100, b.height)) * 2;
          return (
            <div
              key={i}
              style={{ ...barBase, height:`${hh}px` }}
              onMouseEnter={()=> setHoverBar({ panel: panelKey, idx:i })}
              onMouseLeave={()=> setHoverBar(null)}
              onMouseDown={(e)=>{
                if (!isEditable) return;
                const startY = e.clientY; const startH = hh;
                const onMove = (me: MouseEvent)=>{
                  const delta = startY - me.clientY; // px
                  const newHeightPx = Math.max(0, startH + delta);
                  const newVal = Math.round(newHeightPx / 2);
                  const next = [...series];
                  next[i] = { ...next[i], height: newVal };
                  if (panelKey==='left') setLeftSeries(next); else setRightSeries(next);
                };
                const onUp = ()=>{ window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); pushState(panelKey); };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
              }}
            >
              <div style={{ position:'absolute', bottom:`${hh + 6}px`, left:'50%', transform:'translateX(-50%)', color:'#9D9D9D', fontSize:'12px', whiteSpace:'nowrap', cursor: isEditable ? 'pointer':'default' }}
                onClick={()=> isEditable && setEdit({ key: `${panelKey}-val-${i}` })}
              >
                {edit?.key===`${panelKey}-val-${i}` ? (
                  <ImprovedInlineEditor initialValue={b.value} onSave={(v)=>{ const next=[...series]; next[i] = { ...next[i], value:v }; if (panelKey==='left') setLeftSeries(next); else setRightSeries(next); pushState(panelKey); setEdit(null); }} onCancel={()=> setEdit(null)} style={{ background:'transparent', border:'none', outline:'none', color:'#9D9D9D', fontSize:'12px' }} />
                ) : b.value }
              </div>
              {isEditable && hoverBar && hoverBar.panel===panelKey && hoverBar.idx===i && (
                <button onClick={()=> { const next=series.filter((_,idx)=> idx!==i); if (panelKey==='left') setLeftSeries(next); else setRightSeries(next); pushState(panelKey); }} style={{ position:'absolute', top:'-10px', right:'-10px', width:'22px', height:'22px', borderRadius:'50%', border:'1px solid #5a5a5a', background:'#29282A', color:'#E5E7EB', cursor:'pointer' }}>×</button>
              )}
            </div>
          );
        })}
        {isEditable && hoverPanel===panelKey && (
          <button onClick={()=> { const next=[...series, { year: String(2000+series.length+1), value:'New', height:50 }]; if (panelKey==='left') setLeftSeries(next); else setRightSeries(next); pushState(panelKey); }} style={{ position:'absolute', right:'6px', top:'6px', background:'#0d0d0d', color:'#fff', border:'none', borderRadius:'6px', padding:'6px 10px', cursor:'pointer' }}>Add</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="data-driven-insights inter-theme" style={slide}>
      <div style={tagStyle}>
        {isEditable && edit?.key==='tag' ? (
          <ImprovedInlineEditor initialValue={tag} onSave={(v)=>{ onUpdate&&onUpdate({ tag:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inlineStable(tagStyle)} />
        ) : (
          <div onClick={()=> isEditable && setEdit({ key:'tag' })} style={{ cursor: isEditable ? 'pointer':'default' }}>{tag}</div>
        )}
      </div>

      <div style={titleWrap}>
        {isEditable && edit?.key==='title' ? (
          <ImprovedInlineEditor initialValue={title} onSave={(v)=>{ onUpdate&&onUpdate({ title:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={{ ...titleStyle }} />
        ) : (
          <div onClick={()=> isEditable && setEdit({ key:'title' })} style={{ ...titleStyle, cursor: isEditable ? 'pointer':'default' }}>{title}</div>
        )}
      </div>

      <div style={descWrap}>
        {isEditable && edit?.key==='desc' ? (
          <ImprovedInlineEditor initialValue={description} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ description:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={{ ...descStyle }} />
        ) : (
          <div onClick={()=> isEditable && setEdit({ key:'desc' })} style={{ ...descStyle, cursor: isEditable ? 'pointer':'default' }}>{description}</div>
        )}
      </div>

      <div style={chartsWrap}>
        <div style={panel} onMouseEnter={()=> setHoverPanel('left')} onMouseLeave={()=> setHoverPanel(null)}>
          {isEditable && edit?.key==='lct' ? (
            <ImprovedInlineEditor initialValue={leftChartTitle} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ leftChartTitle:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inlineStable({ color:'#999999', fontSize:'14px' })} />
          ) : (
            <div onClick={()=> isEditable && setEdit({ key:'lct' })} style={{ color:'#999999', fontSize:'14px', cursor: isEditable ? 'pointer':'default' }}>{leftChartTitle}</div>
          )}
          {renderBars('left', leftSeries)}
          <div style={yearRow}>{leftSeries.map((b,i)=>(
            <span key={i} onClick={()=> isEditable && setEdit({ key:`left-year-${i}` })} style={{ cursor: isEditable ? 'pointer':'default', width:'40px', textAlign:'center' }}>
              {edit?.key===`left-year-${i}` ? (
                <ImprovedInlineEditor initialValue={b.year} onSave={(v)=>{ const next=[...leftSeries]; next[i]={ ...next[i], year:v }; setLeftSeries(next); pushState('left'); setEdit(null); }} onCancel={()=> setEdit(null)} style={inlineStable({ color:'#AAA9A7', fontSize:'12px' })} />
              ) : b.year}
            </span>
          ))}</div>
        </div>

        <div style={panel} onMouseEnter={()=> setHoverPanel('right')} onMouseLeave={()=> setHoverPanel(null)}>
          {isEditable && edit?.key==='rct' ? (
            <ImprovedInlineEditor initialValue={rightChartTitle} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ rightChartTitle:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inlineStable({ color:'#999999', fontSize:'14px' })} />
          ) : (
            <div onClick={()=> isEditable && setEdit({ key:'rct' })} style={{ color:'#999999', fontSize:'14px', cursor: isEditable ? 'pointer':'default' }}>{rightChartTitle}</div>
          )}
          {renderBars('right', rightSeries)}
          <div style={yearRow}>{rightSeries.map((b,i)=>(
            <span key={i} onClick={()=> isEditable && setEdit({ key:`right-year-${i}` })} style={{ cursor: isEditable ? 'pointer':'default', width:'40px', textAlign:'center' }}>
              {edit?.key===`right-year-${i}` ? (
                <ImprovedInlineEditor initialValue={b.year} onSave={(v)=>{ const next=[...rightSeries]; next[i]={ ...next[i], year:v }; setRightSeries(next); pushState('right'); setEdit(null); }} onCancel={()=> setEdit(null)} style={inlineStable({ color:'#AAA9A7', fontSize:'12px' })} />
              ) : b.year}
            </span>
          ))}</div>
        </div>
      </div>

      <div style={rightMetrics}>
        {metrics.map((m, i)=> (
          <div key={i}>
            <div style={metricValue} onClick={()=> isEditable && setEdit({ key:`mv${i}` })}>
              {isEditable && edit?.key===`mv${i}` ? (
                <ImprovedInlineEditor initialValue={m.value} onSave={(v)=>{ const next=[...metrics]; next[i]={ ...next[i], value:v }; onUpdate&&onUpdate({ metrics: next }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inlineStable(metricValue)} />
              ) : (
                m.value
              )}
            </div>
            <div style={metricCaption} onClick={()=> isEditable && setEdit({ key:`mc${i}` })}>
              {isEditable && edit?.key===`mc${i}` ? (
                <ImprovedInlineEditor initialValue={m.caption} multiline={true} onSave={(v)=>{ const next=[...metrics]; next[i]={ ...next[i], caption:v }; onUpdate&&onUpdate({ metrics: next }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inlineStable(metricCaption)} />
              ) : (
                m.caption
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={avatar}>
        <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
      </div>
    </div>
  );
};

export default DataDrivenInsightsSlideTemplate;