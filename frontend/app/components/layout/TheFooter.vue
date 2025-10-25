<script setup lang="ts">
import type { MenuItem } from '~/types';

const props = defineProps<{
  navItems?: MenuItem[];
}>();

const api = useApi();

// 获取站点信息
const { data: siteInfo } = await useAsyncData('site-footer', () => api.getSiteInfo());

const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-content">
        <!-- Footer 导航 -->
        <nav v-if="navItems && navItems.length" class="footer-nav">
          <NuxtLink
            v-for="item in navItems"
            :key="item.id"
            :to="`/${item.slug}`"
            class="footer-link"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- 社交媒体链接 -->
        <div v-if="siteInfo?.settings?.socialLinks" class="social-links">
          <a
            v-if="siteInfo.settings.socialLinks.facebook"
            :href="siteInfo.settings.socialLinks.facebook"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
          >
            Facebook
          </a>
          <a
            v-if="siteInfo.settings.socialLinks.twitter"
            :href="siteInfo.settings.socialLinks.twitter"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
          >
            Twitter
          </a>
          <a
            v-if="siteInfo.settings.socialLinks.instagram"
            :href="siteInfo.settings.socialLinks.instagram"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
          >
            Instagram
          </a>
        </div>

        <!-- 联系信息 -->
        <div v-if="siteInfo?.settings?.contact" class="contact-info">
          <p v-if="siteInfo.settings.contact.email">
            Email: {{ siteInfo.settings.contact.email }}
          </p>
          <p v-if="siteInfo.settings.contact.phone">
            电话: {{ siteInfo.settings.contact.phone }}
          </p>
          <p v-if="siteInfo.settings.contact.address">
            地址: {{ siteInfo.settings.contact.address }}
          </p>
        </div>

        <!-- 版权信息 -->
        <div class="copyright">
          <p>&copy; {{ currentYear }} {{ siteInfo?.name || 'CMS' }}. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: #1f2937;
  color: #e5e7eb;
  padding: 3rem 0 1.5rem;
  margin-top: 4rem;
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.footer-nav {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  color: #e5e7eb;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--primary-color);
}

.social-links {
  display: flex;
  gap: 1.5rem;
}

.social-link {
  color: #e5e7eb;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border: 1px solid #4b5563;
  border-radius: var(--border-radius);
  transition: all 0.2s;
}

.social-link:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.contact-info {
  text-align: center;
  font-size: 0.875rem;
  color: #9ca3af;
}

.contact-info p {
  margin-bottom: 0.25rem;
}

.copyright {
  text-align: center;
  font-size: 0.875rem;
  color: #9ca3af;
  padding-top: 1.5rem;
  border-top: 1px solid #374151;
  width: 100%;
}

@media (max-width: 768px) {
  .footer-nav {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .social-links {
    flex-wrap: wrap;
  }
}
</style>
