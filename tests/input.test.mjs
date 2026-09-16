import test from 'node:test';import assert from 'node:assert/strict';import{pointerRole,normalizePressure}from'../src/input.js';
test('pen and mouse draw while touch navigates',()=>{assert.equal(pointerRole('pen'),'draw');assert.equal(pointerRole('mouse'),'draw');assert.equal(pointerRole('touch'),'navigate');});
test('mouse pressure is fixed while Pencil pressure is preserved',()=>{assert.equal(normalizePressure(.1,'mouse'),.62);assert.ok(Math.abs(normalizePressure(.82,'pen')-.8416)<1e-6);});
