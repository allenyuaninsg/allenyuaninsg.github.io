import * as ex from 'excalibur';

export const Config = {
	BirdStartPos: ex.vec(200, 300),
	BirdAcceleration: 1000,
	BirdJumpVelocity: -800,
	BirdMinVelocity: -500,
	BirdMaxVelocity: 500,
	PipeSpeed: 150,
	PipeInterval: 1500,
	PipeGap: 200
} as const;
