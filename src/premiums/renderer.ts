import {
	BitmapCoordinatesRenderingScope,
	CanvasRenderingTarget2D,
} from 'fancy-canvas';
import {
	Coordinate,
	ICustomSeriesPaneRenderer,
	PaneRendererCustomData,
	PriceToCoordinateConverter,
	Time,
} from 'lightweight-charts';
import { LollipopData } from './data-schema';
import { LollipopSeriesOptions } from './options';
import {
	positionsBox,
	positionsLine,
} from '../helpers/dimensions/positions'

interface LollipopBarItem {
	x: number;
	y1: Coordinate | number;
    y2: Coordinate | number;
}

export class LollipopSeriesRenderer<TData extends LollipopData>
	implements ICustomSeriesPaneRenderer
{
	_data: PaneRendererCustomData<Time, TData> | null = null;
	_options: LollipopSeriesOptions | null = null;

	draw(
		target: CanvasRenderingTarget2D,
		priceConverter: PriceToCoordinateConverter
	): void {
		target.useBitmapCoordinateSpace(scope =>
			this._drawImpl(scope, priceConverter)
		);
	}

	update(
		data: PaneRendererCustomData<Time, TData>,
		options: LollipopSeriesOptions
	): void {
		this._data = data;
		this._options = options;
	}

	_drawImpl(
		renderingScope: BitmapCoordinatesRenderingScope,
		priceToCoordinate: PriceToCoordinateConverter
	): void {
		if (
			this._data === null ||
			this._data.bars.length === 0 ||
			this._data.visibleRange === null ||
			this._options === null
		) {
			return;
		}
		const options = this._options;
		const bars: LollipopBarItem[] = this._data.bars.map(bar => {
			return {
				x: bar.x,
                y1: priceToCoordinate(bar.originalData.value1) ?? 0,
                y2: priceToCoordinate(bar.originalData.value2) ?? 0,
			};
		});

		const lineWidth = Math.min(this._options.lineWidth, this._data.barSpacing);

		const barWidth = this._data.barSpacing;
		const radius = Math.floor(barWidth / 2);
		const zeroY = priceToCoordinate(0);
		for (
			let i = this._data.visibleRange.from;
			i < this._data.visibleRange.to;
			i++
		) {
			const bar = bars[i];
			const xPosition = positionsLine(
				bar.x,
				renderingScope.horizontalPixelRatio,
				lineWidth
			);
			// Calculate positions for y1 and y2
            const y1PositionBox = positionsBox(
                zeroY ?? 0,
                bar.y1,
                renderingScope.verticalPixelRatio
            );
        
            const y2PositionBox = positionsBox(
                zeroY ?? 0,
                bar.y2,
                renderingScope.verticalPixelRatio
            );

			renderingScope.context.beginPath();
			renderingScope.context.fillStyle = options.color;
			// Draw the line for y1
            renderingScope.context.fillRect(
                xPosition.position,
                y1PositionBox.position,
                xPosition.length,
                y1PositionBox.length
            );
            
            // Draw the circle at y1
            renderingScope.context.arc(
                bar.x * renderingScope.horizontalPixelRatio,
                bar.y1 * renderingScope.verticalPixelRatio,
                radius * renderingScope.horizontalPixelRatio,
                0,
                Math.PI * 2
            );
            renderingScope.context.fill();
            
            // Draw the circle at y2
            renderingScope.context.arc(
                bar.x * renderingScope.horizontalPixelRatio,
                bar.y2 * renderingScope.verticalPixelRatio,
                radius * renderingScope.horizontalPixelRatio,
                0,
                Math.PI * 2
            );
			renderingScope.context.fill();
		}
	}
}