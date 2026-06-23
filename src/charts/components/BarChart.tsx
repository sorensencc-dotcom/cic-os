import React from 'react';
import { XYChart, BarSeries, XAxis, YAxis, Tooltip, Grid } from '@visx/xychart';
import { chartTokens } from '../tokens/chart-scales';
import { useChartDimensions } from '../hooks/useChartDimensions';
import { useChartData, DataPoint } from '../hooks/useChartData';
import '../tokens/chart-colors.css';

export interface BarChartProps {
  data: DataPoint[];
  xAccessor?: (d: DataPoint) => number | string;
  yAccessor?: (d: DataPoint) => number;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  color?: string;
}

export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  (
    {
      data,
      xAccessor = (d) => d.x,
      yAccessor = (d) => d.y,
      title,
      xLabel = 'Category',
      yLabel = 'Value',
      height = 400,
      color = chartTokens.colors.primary,
    },
    ref,
  ) => {
    const { width, height: measuredHeight, ref: dimRef } = useChartDimensions();
    const chartData = useChartData({ data, xAccessor, yAccessor });

    const finalHeight = height > 0 ? height : measuredHeight;
    const finalWidth = width > 0 ? width : 800;

    if (!data || data.length === 0) {
      return (
        <div ref={dimRef || ref} style={{ width: '100%', height: finalHeight }} className="chart-wrapper">
          <div style={{ padding: '20px', textAlign: 'center' }}>No data available</div>
        </div>
      );
    }

    return (
      <div ref={dimRef || ref} style={{ width: '100%', height: finalHeight }} className="chart-wrapper">
        {title && <h3 style={{ margin: '8px 16px 0', fontSize: '14px', fontWeight: 600 }}>{title}</h3>}
        <XYChart
          width={finalWidth}
          height={finalHeight - (title ? 32 : 0)}
          margin={chartTokens.margins}
          xScale={{ type: 'band', domain: chartData.data.map((d, i) => i) }}
          yScale={{
            type: 'linear',
            domain: [0, Math.max(...chartData.data.map(yAccessor))],
            range: [finalHeight - (title ? 32 : 0) - chartTokens.margins.bottom, chartTokens.margins.top],
          }}
        >
          <Grid rows columns strokeOpacity={0.1} strokeWidth={1} />
          <XAxis label={xLabel} labelOffset={12} tickLabelProps={() => ({ className: 'chart-axis-label' })} />
          <YAxis label={yLabel} labelOffset={12} tickLabelProps={() => ({ className: 'chart-axis-label' })} />
          <BarSeries dataKey="bars" data={chartData.data} xAccessor={(_, i) => i} yAccessor={yAccessor} fill={color} />
          <Tooltip
            snapTooltipToCursor
            renderTooltip={({ tooltipData }) =>
              tooltipData ? (
                <div className="chart-tooltip">
                  <div>{xLabel}: {tooltipData.nearestDatum?.index}</div>
                  <div>{yLabel}: {tooltipData.nearestDatum?.datum?.y}</div>
                </div>
              ) : null
            }
          />
        </XYChart>
      </div>
    );
  },
);

BarChart.displayName = 'BarChart';
