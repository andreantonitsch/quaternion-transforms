float PHI = 1.61803398874989484820459;  //Golden Ratio   

// Input: It uses texture coords as the random number seed.
// Output: Random number: [0,1), that is between 0.0 and 0.999999... inclusive.
// Author: Michael Pohoreski
// Copyright: Copyleft 2012 :-)
// NOTE: This has been upgraded to version 3 !!
float random( vec2 p )
{
  // We need irrationals for pseudo randomness.
  // Most (all?) known transcendental numbers will (generally) work.
  const vec2 r = vec2(
    23.1406926327792690,  // e^pi (Gelfond's constant)
     2.6651441426902251); // 2^sqrt(2) (Gelfond–Schneider constant)
  return fract( cos( mod( 123456789., 1e-7 + 256. * dot(p,r) ) ) );  
}

//https://www.shadertoy.com/view/XlXcW4
//const uint k = 134775813U;   // Delphi and Turbo Pascal
//const uint k = 20170906U;    // Today's date (use three days ago's dateif you want a prime)
//const uint k = 1664525U;     // Numerical Recipes
  // GLIB C
// vec3 hash33( ivec3 x )
// {
//     const uint k = 1103515245U;
//     x = ((x>>8U)^x.yzx)*k;
//     x = ((x>>8U)^x.yzx)*k;
//     x = ((x>>8U)^x.yzx)*k;

//     return vec3(x)*(1.0/float(0xffffffffU));
// }