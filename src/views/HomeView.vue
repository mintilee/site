<script setup lang="ts">
import { getWeatherData } from '@/api';
import { createCacheStorage } from '@/utils/Storage'
import { onMounted } from 'vue';

const storageSession = createCacheStorage({ useSessionStorage: true })

onMounted(() => {
  getWeatherData().then((response) => {
    console.log(response, "<======请求成功===========>");

  }, err => {
    console.log(err, "<======请求失败===========>");

  })
})
</script>

<template>
  <main>
    test
  </main>
</template>
