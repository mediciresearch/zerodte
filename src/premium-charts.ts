import { WhitespaceData, createChart } from 'lightweight-charts';
import { generateLollipopData } from './premiums/premiums-data-generator';
import { LollipopSeries } from './premiums/premiums-series';
import { LollipopData } from './premiums/data-schema';

// this tells which html container to generate the chart in
const chart = createChart(document.getElementById('chart') as HTMLElement, {
	autoSize: true,
});

const customSeriesView = new LollipopSeries();
const myCustomSeries = chart.addCustomSeries(customSeriesView, {
	lineWidth: 2,
});

const data: LollipopData[] = generateLollipopData(100);
myCustomSeries.setData(data);