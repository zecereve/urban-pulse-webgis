async function test() {
    const shp = await import("shpjs");
    console.log("Keys:", Object.keys(shp));
    if (shp.default) console.log("Default keys:", Object.keys(shp.default));
}
test();
