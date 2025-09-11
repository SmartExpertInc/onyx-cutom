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
  barLabels: string[]; // 5 years labels
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
  leftBars = [33,39,55,44,67,35],
  rightBars = [33,39,55,44,67,35],
  barLabels = ['2017','2018','2019','2020','2021','2022'],
  leftValues = ['33M','39M','55M','44M','67M','35M'],
  rightValues = ['33M','39M','55M','44M','67M','35M'],
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

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#1A1A1A', color:'#E5E7EB', fontFamily: currentTheme.fonts.titleFont, position:'relative' };
  const tagStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'40px', background:'#282828', color:'#9B9B9B', padding:'8px 18px', fontSize:'16px' };
  const titleStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'90px', fontSize:'38px', fontWeight:800, color:'#D2D2D2' };
  const descStyle: React.CSSProperties = { position:'absolute', left:'40px', top:'160px', width:'795px', color:'#909090', fontSize:'14px' };

  const chartsWrap: React.CSSProperties = { position:'absolute', left:'40px', top:'270px', width:'725px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' };
  const panel: React.CSSProperties = { background:'#29282A', height:'338px', padding:'16px 18px', borderRadius:'2px' };
  const chartArea: React.CSSProperties = { position:'relative', height:'220px', padding:'16px 18px 8px 0' };
  const barsRow: React.CSSProperties = { position:'absolute', left:'54px', right:'18px', bottom:'8px', display:'flex', alignItems:'flex-end', gap:'10px', height:'calc(100% - 24px)' };
  const yAxis: React.CSSProperties = { position:'absolute', left:0, top:'16px', bottom:'8px', width:'54px', color:'#9C9C9C', fontSize:'12px' };
  const barBase: React.CSSProperties = { width:'75px', background:'#894DF4', position:'relative' };
  const yearRow: React.CSSProperties = { display:'flex', justifyContent:'space-between', padding:'0 18px 0 54px', color:'#AAA9A7', fontSize:'12px' };

  const rightMetrics: React.CSSProperties = { position:'absolute', right:'0', top:'260px', width:'385px', display:'grid', rowGap:'15px' };
  const metricValue: React.CSSProperties = { fontSize:'38px', fontWeight:800, color:'#DBDBDB' };
  const metricCaption: React.CSSProperties = { marginTop:'6px', width:'270px', color:'#929292', fontSize:'15px' };
  const avatar: React.CSSProperties = { position:'absolute', right:'64px', top:'72px', width:'120px', height:'120px', borderRadius:'50%', overflow:'hidden', background:'#1F2125' };

  const inline = (base: React.CSSProperties): React.CSSProperties => ({ ...base, position:'relative', background:'transparent', border:'none', outline:'none', padding:0, margin:0 });

  const renderBars = (bars: number[], values: string[]) => (
    <div style={chartArea}>
      <div style={yAxis}>
        <div style={{ position:'absolute', left:0, bottom:0 }}>0</div>
        {yTicks.map((t)=> (
          <div key={t} style={{ position:'absolute', left:0, bottom:`${t*2}px` }}>{t}</div>
        ))}
      </div>
      {/* grid lines removed as requested */}
      <div style={barsRow}>
        {bars.map((h, i)=> {
          const hh = Math.max(0, Math.min(100, h)) * 2;
          return (
            <div key={i} style={{ ...barBase, height:`${hh}px` }}>
              <div style={{ position:'absolute', bottom:`${hh + 6}px`, left:'50%', transform:'translateX(-50%)', color:'#9D9D9D', fontSize:'12px', whiteSpace:'nowrap' }}>{values[i] ?? ''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="data-driven-insights inter-theme" style={slide}>
      <div style={tagStyle}>
        {isEditable && edit?.key==='tag' ? (
          <ImprovedInlineEditor initialValue={tag} onSave={(v)=>{ onUpdate&&onUpdate({ tag:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(tagStyle)} />
        ) : (
          <div onClick={()=> isEditable && setEdit({ key:'tag' })} style={{ cursor: isEditable ? 'pointer':'default' }}>{tag}</div>
        )}
      </div>
      <div style={titleStyle}>
        {isEditable && edit?.key==='title' ? (
          <ImprovedInlineEditor initialValue={title} onSave={(v)=>{ onUpdate&&onUpdate({ title:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(titleStyle)} />
        ) : (
          <div onClick={()=> isEditable && setEdit({ key:'title' })} style={{ cursor: isEditable ? 'pointer':'default' }}>{title}</div>
        )}
      </div>
      <div style={descStyle}>
        {isEditable && edit?.key==='desc' ? (
          <ImprovedInlineEditor initialValue={description} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ description:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(descStyle)} />
        ) : (
          <div onClick={()=> isEditable && setEdit({ key:'desc' })} style={{ cursor: isEditable ? 'pointer':'default' }}>{description}</div>
        )}
      </div>

      <div style={chartsWrap}>
        <div style={panel}>
          {isEditable && edit?.key==='lct' ? (
            <ImprovedInlineEditor initialValue={leftChartTitle} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ leftChartTitle:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline({ color:'#999999', fontSize:'14px' })} />
          ) : (
            <div onClick={()=> isEditable && setEdit({ key:'lct' })} style={{ color:'#999999', fontSize:'14px', cursor: isEditable ? 'pointer':'default' }}>{leftChartTitle}</div>
          )}
          {renderBars(leftBars, leftValues)}
          <div style={yearRow}>{barLabels.map((y,i)=>(<span key={i}>{y}</span>))}</div>
        </div>
        <div style={panel}>
          {isEditable && edit?.key==='rct' ? (
            <ImprovedInlineEditor initialValue={rightChartTitle} multiline={true} onSave={(v)=>{ onUpdate&&onUpdate({ rightChartTitle:v }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline({ color:'#999999', fontSize:'14px' })} />
          ) : (
            <div onClick={()=> isEditable && setEdit({ key:'rct' })} style={{ color:'#999999', fontSize:'14px', cursor: isEditable ? 'pointer':'default' }}>{rightChartTitle}</div>
          )}
          {renderBars(rightBars, rightValues)}
          <div style={yearRow}>{barLabels.map((y,i)=>(<span key={i}>{y}</span>))}</div>
        </div>
      </div>

      <div style={rightMetrics}>
        {metrics.map((m, i)=> (
          <div key={i}>
            <div style={metricValue} onClick={()=> isEditable && setEdit({ key:`mv${i}` })}>
              {isEditable && edit?.key===`mv${i}` ? (
                <ImprovedInlineEditor initialValue={m.value} onSave={(v)=>{ const next=[...metrics]; next[i]={ ...next[i], value:v }; onUpdate&&onUpdate({ metrics: next }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(metricValue)} />
              ) : (
                m.value
              )}
            </div>
            <div style={metricCaption} onClick={()=> isEditable && setEdit({ key:`mc${i}` })}>
              {isEditable && edit?.key===`mc${i}` ? (
                <ImprovedInlineEditor initialValue={m.caption} multiline={true} onSave={(v)=>{ const next=[...metrics]; next[i]={ ...next[i], caption:v }; onUpdate&&onUpdate({ metrics: next }); setEdit(null); }} onCancel={()=> setEdit(null)} style={inline(metricCaption)} />
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

