
float PI = 3.14159265359;
float TAU = 6.28318530717;
vec3 sphere_sample(vec3 seed)
{
    // float tx = random(seed.xy);
    // float ty = random(seed.yz);
    // float tz = random(seed.zw);
    float tx = seed.x;
    float ty = seed.y;
    float tz = seed.z;
    vec3 t = vec3(tx, ty, tz);

    float radius = 2.5;
    float theta = t.x * PI * 2.0;
    float phi = acos(1.0 - t.y * PI * 2.0);
    float x = radius * sin(phi) * cos(theta);
    float y = radius * sin(phi) * sin(theta);
    float z = radius * cos(phi);

    return vec3(x, y, z);
}

vec3 non_uniform_sphere_sample1(vec3 seed)
{
    float tx = random(seed.xy);
    float ty = random(seed.yz);
    float tz = random(seed.zx);
    vec3 t = vec3(tx, ty, tz);

    float radius = t.z * 2.5;
    float theta = t.x * PI * 2.0;
    float phi = t.y * PI * 1.0;
    float x = radius * sin(phi) * cos(theta);
    float y = radius * sin(phi) * sin(theta);
    float z = radius * cos(phi);

    return vec3(x, y, z);
}

vec3 cube_sample(vec3 seed){
    float tx = random(vec2(fract(seed.x * TAU), fract(seed.y * TAU)));
    float ty = random(vec2(fract(tx + PHI -1.0), fract(tx + PHI -1.0 + PHI -1.0)));
    float tz = random(vec2(fract(ty + PHI -1.0),  fract(ty + PHI -1.0 + PHI -1.0)));
    vec3 t = vec3(tx * 2.0 - 1.0, ty * 2.0 - 1.0, tz * 2.0 - 1.0);

    float x = t.x;
    float y = t.y;
    float z = t.z;

    return vec3(x, y, z);
}

vec3 torus_sample(float r, float r2){
    return vec3(0.0, 0.0, 0.0);
}