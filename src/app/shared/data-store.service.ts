import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { BlogData } from '../blogs/blogs.component';
import { map, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataStroreService {
  blogsChanges = new Subject<BlogData[]>();
  hasMore: boolean = true;
  blogs: BlogData[] = [];
  offset = 0;
  
  constructor(private http: HttpClient, private authService: AuthService) {}
  getUser() {
    this.authService.user.subscribe((user) => {
      console.log(user);
    });
  }

  fetchBlog() {
    console.log('get blog');
    this.offset = this.blogs?.length ? this.blogs.length + 1 : 0;
    const BlogUrl = `https://api.slingacademy.com/v1/sample-data/blog-posts?offset=${this.offset}&limit=30`;
    return this.http.get<any>(BlogUrl);
  }

  setBlogs(blogs: BlogData[]) {
    this.blogs = [...new Set([...this.blogs, ...blogs])];
    this.blogsChanges.next(this.blogs.slice());
  }
  getBlogs() {
    return this.blogs.slice();
  }
}
