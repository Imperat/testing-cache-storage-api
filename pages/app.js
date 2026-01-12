const CACHE_NAME = 'stress-test-cache';
async function testCacheStorage(log) {
  const TOTAL_FILES = 50000;
  const BATCH_SIZE = 100; // Process in batches to avoid overwhelming the browser
  const FILE_SIZE = 1024; // 1KB per file
  
  log(`🚀 Starting Cache Storage stress test with ${TOTAL_FILES} files`);
  log(`Cache name: ${CACHE_NAME}`);
  log(`Batch size: ${BATCH_SIZE}`);
  log('='.repeat(60));
  
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  
  try {
    const cache = await caches.open(CACHE_NAME);
    log('✓ Cache opened successfully\n');
    
    // Process files in batches
    for (let batch = 0; batch < Math.ceil(TOTAL_FILES / BATCH_SIZE); batch++) {
      const batchStart = batch * BATCH_SIZE;
      const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_FILES);
      const batchPromises = [];
      
      for (let i = batchStart; i < batchEnd; i++) {
        const url = `https://example.com/file-${i}.txt`;
        const content = `File ${i}: ${'x'.repeat(FILE_SIZE)}`;
        
        const response = new Response(content, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
        
        batchPromises.push(
          cache.put(url, response)
            .then(() => { successCount++; })
            .catch(err => { 
              errorCount++; 
              log(`Failed to cache file ${i}:`, err.message);
            })
        );
      }
      
      await Promise.all(batchPromises);
      
      // Progress update
      const progress = ((batchEnd / TOTAL_FILES) * 100).toFixed(1);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      log(`Progress: ${progress}% (${batchEnd}/${TOTAL_FILES}) - ${elapsed}s elapsed - Errors: ${errorCount}`);
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('\n' + '='.repeat(60));
    log('✅ Test completed!');
    log(`Total time: ${totalTime}s`);
    log(`Success: ${successCount}`);
    log(`Errors: ${errorCount}`);
    log('='.repeat(60));
    
    // Verify cache contents
    const keys = await cache.keys();
    log(`\n📊 Cache contains ${keys.length} entries`);
    
    // Storage estimate
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usedMB = (estimate.usage / 1024 / 1024).toFixed(2);
      const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2);
      const percentUsed = ((estimate.usage / estimate.quota) * 100).toFixed(1);
      log(`💾 Storage: ${usedMB} MB / ${quotaMB} MB (${percentUsed}%)`);
    }
    
  } catch (error) {
    log('❌ Fatal error:', error);
    log('Stack:', error.stack);
  }
};

async function testCacheOpening(log) {
  log('test cache opening...');
  const p1 = performance.now();
  const cc = await self.caches.open(CACHE_NAME);
  const p2 = performance.now();
  log(`It took: ${p2 - p1} to open cache!`);
}

(function () {
  var output = document.getElementById("output");
  var btn = document.getElementById("btn");

  function log(msg) {
    output.textContent += msg + "\n";
    console.log(msg);
  }

  log("JS loaded");

  btn.addEventListener("click", function () {
    log("Button clicked at " + new Date().toISOString());
    testCacheStorage(log);
    testCacheOpening(log);
  });
})();
