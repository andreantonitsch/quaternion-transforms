const vec4 identity_quat = vec4(1.0, 0.0, 0.0, 0.0);


//angle in radians
// takes into account  threejs multiplication order
vec4 quat_from_euler(vec3 axis, float angle){
    float x = axis.x * sin(angle / 2.0);
    float y = axis.y * sin(angle / 2.0);
    float z = axis.z * sin(angle / 2.0);
    float w = cos(angle /2.0 );
    return normalize(vec4(w,x,y,z));
}


// Quaternion conjugate
//  q^-1  = a, -v
vec4 quat_conjugate(vec4 quat)
{
    return vec4(quat.x, -quat.yzw);
}


// Quat multiplication can be reduced to:
//    (s1, v1)  *  (s2.v2) 
//             ==
//    s1 * s2 - dot(v1, v2),            <- scalar part
//    cross(v1,v2) + s1 * v2 + s2 * v1  <- quaternion part
vec4 quat_mul(vec4 q1, vec4 q2)
{
    return vec4(
        q1.x * q2.x - dot(q1.yzw, q2.yzw),
        cross(q1.yzw, q2.yzw) + q1.x * q2.yzw + q2.x * q1.yzw
    );
}


// Quat division can be reduced to:
//    (s1, v1)  *  (s2.v2) 
//             ==
//    s1 * s2 - dot(v1, v2),            <- scalar part
//    cross(v1,v2) + s1 * v2 + s2 * v1  <- quaternion part
vec4 quat_div(vec4 q1, vec4 q2)
{
    return vec4(
        q1.x * q2.x + dot(q1.yzw, q2.yzw),
        -cross(q1.yzw, q2.yzw) - q1.x * q2.yzw + q2.x * q1.yzw
    );
}


//Quaternion Conjugation
//  applying a rotation Q to a point P can be done by operation
//  P' = Q * P * Q^-1
vec3 conjugation(vec3 p, vec4 quat)
{
    vec4 p4 = vec4(0.0, p);
    return quat_mul(quat_mul(quat, p4), quat_conjugate(quat)).yzw;
}


// Quaternion argument
//  returns the real part scaled by the quaternion length
float quat_arg( vec4 quat){
    return acos(quat.x / length(quat));
}


// Quaternion Sign
//  Returns the imaginary vector scaled by the quaternion length
vec4 quat_sign(vec4 quat)
{
    return quat / length(quat);
}


// Quaternion exponentiation
//  computes e^q
vec4 quat_exp(vec4 quat)
{
    float l = length(quat.yzw);
    vec4 v = vec4(0.0, quat.yzw);
    float lv = length(v);
    return exp(quat.x) * (vec4(cos(lv),0.0, 0.0,0.0)  + (v / lv) * sin(lv));
}


// Quaternion natural log
//  computes ln q
vec4 quat_ln(vec4 quat)
{
    
    vec4 u = vec4(0.0, quat.yzw);
    float lu = length(u);
    return log(length(quat)) + quat_sign(u) * acos(quat.x / length(quat)); 
}


// Quaternion powers
//   computes q^power
vec4 quat_pow(vec4 quat, float power)
{
    float l = length(quat);
    vec4 nv = vec4(0.0, quat.yzw) * power;

    return pow(l, power) * (vec4(cos(nv)) + vec4(0.0, sin(nv).yzw));
}


// Quaternion powers
//   computes q^power
vec4 quat_pow2(vec4 quat, float power)
{
    return quat_exp(power * quat_ln(quat));
}


// Quaternion Spherical Interpolation
vec4 quat_slerp(vec4 q1, vec4 q2, float t)
{
    vec4 q_right = quat_pow(quat_mul(quat_conjugate(q1), q2), t);
    return quat_mul(q1, q_right);
}


//Quaternion Rotation Matrix Form
mat3 quat_matrix_form(vec4 quat)
{
    mat3  mat;
    mat[0] = vec3(1.0 - (2.0 * quat.z * quat.z) - (2.0 * quat.w * quat.w), 
                        (2.0 * quat.y * quat.z) - (2.0 * quat.w * quat.x),
                        (2.0 * quat.y * quat.w) + (2.0 * quat.z * quat.x));

    mat[1] = vec3(      (2.0 * quat.y * quat.z) + (2.0 * quat.w * quat.x),
                  1.0 - (2.0 * quat.y * quat.y) - (2.0 * quat.w * quat.w), 
                        (2.0 * quat.z * quat.w) - (2.0 * quat.y * quat.x));

    mat[1] = vec3(      (2.0 * quat.y * quat.w) - (2.0 * quat.z * quat.x),
                        (2.0 * quat.z * quat.w) + (2.0 * quat.y * quat.x),
                  1.0 - (2.0 * quat.y * quat.y) - (2.0 * quat.z * quat.z)); 
    return mat;
}