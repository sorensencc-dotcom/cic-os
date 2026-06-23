import React from 'react';
import { XYChart, ScatterSeries, XAxis, YAxis, Tooltip, Grid } from '@visx/xychart';
import { chartTokens } from '../tokens/chart-scales';
import { useChartDimensions } from '../hooks/useChartDimensions';
import { useChartData, DataPoint } from '../hooks/useChartData';
import '../tokens/chart-colors.css';

export interface ScatterChartProps {
  data: DataPoint[];
  xAccessor?: (d: DataPoint) => number;
  yAccessor?: (d: DataPoint) => number;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  color?: string;
}

export const ScatterChart = React.forwardRef<HTMLDivElement, ScatterChartProps>(
  (
    {
      data,
      xAccessor = (d) => (typeof d.x === 'number' ? d.x : 0),
      yAccessor = (d) => d.y,
      title,
      xLabel = 'X Axis',
      yLabel = 'Y Axis',
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
          xScale={{
            type: 'linear',
            domain: [Math.min(...chartData.data.map(xAccessor)), Math.max(...chartData.data.map(xAccessor))],
            range: [chartTokens.margins.left, finalWidth - chartTokens.margins.right],
          }}
          yScale={{
            type: 'linear',
            domain: chartData.yExtent,
            range: [finalHeight - (title ? 32 : 0) - chartTokens.margins.bottom, chartTokens.margins.top],
          }}
        >
          <Grid rows columns strokeOpacity={0.1} strokeWidth={1} />
          <XAxis label={xLabel} labelOffset={12} tickLabelProps={() => ({ className: 'chart-axis-label' })} />
          <YAxis label={yLabel} labelOffset={12} tickLabelProps={() => ({ className: 'chart-axis-label' })} />
          <ScatterSeries
            dataKey="scatter"
            data={chartData.data}
            xAccessor={xAccessor}
            yAccessor={yAccessor}
            fill={color}
            size={50}
          />
          <Tooltip
            snapTooltipToCursor
            renderTooltip={({ tooltipData }) =>
              tooltipData ? (
                <div className="chart-tooltip">
                  <div>{xLabel}: {tooltipData.nearestDatum?.datum?.x}</div>
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

ScatterChart.displayName = 'ScatterChart';
