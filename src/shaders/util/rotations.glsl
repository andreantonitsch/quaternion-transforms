// Rotates a point around an arbitrary AXIS by an angle THETA
//      Precons:
//              axis must be normalized
//              angles in radians
mat3 rotation_matrix(vec3 axis, float theta){
    float cos_theta = cos(theta);
    float minus_cos_theta = 1.0 - cos_theta;
    float sin_theta = sin(theta);
    float n12 = axis.x * axis.x;
    float n22 = axis.y * axis.y;
    float n32 = axis.z * axis.z;
    float n1n2 = axis.x * axis.y;
    float n1n3 = axis.x * axis.z;
    float n2n3 = axis.y * axis.z;

    mat3 rot_mat;
    rot_mat[0] = vec3(cos_theta + n12 * minus_cos_theta, n1n2 * minus_cos_theta + axis.z * sin_theta, n1n3 * minus_cos_theta - axis.y * sin_theta);
    rot_mat[1] = vec3(n1n2 * minus_cos_theta - axis.z * sin_theta, cos_theta + n22 * minus_cos_theta, n2n3 * minus_cos_theta + axis.x * sin_theta);
    rot_mat[2] = vec3(n1n3 * minus_cos_theta + axis.y * sin_theta, n2n3 * minus_cos_theta - axis.x * sin_theta, cos_theta + n32 * minus_cos_theta);

    return rot_mat;
}

