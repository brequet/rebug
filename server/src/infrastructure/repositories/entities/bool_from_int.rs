use serde::{self, Deserialize, Deserializer};

// This function will be used by serde to deserialize an integer into a boolean.
pub fn deserialize<'de, D>(deserializer: D) -> Result<bool, D::Error>
where
    D: Deserializer<'de>,
{
    // Deserialize the value as i64 and map it to a boolean.
    // 0 -> false, any other value -> true.
    Ok(i64::deserialize(deserializer)? != 0)
}

pub fn serialize<S>(value: &bool, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    // Serialize the boolean as an integer.
    // false -> 0, true -> 1.
    serializer.serialize_i64(if *value { 1 } else { 0 })
}
