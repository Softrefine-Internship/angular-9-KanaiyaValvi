import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

import { DataStroreService } from '../shared/data-store.service';
import { Subscription } from 'rxjs';
export interface BlogData {
  category: string;
  content_html: string;
  content_text: string;
  created_at: string;
  description: string;
  id: number;
  photo_url: string;
  title: string;
  updated_at: string;
  user_id: number;
}
@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss'],
})
export class BlogsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lastElement') lastElement!: ElementRef<HTMLDivElement>;
  isLoading: boolean = false;
  hasMore: boolean = true;
  blogs!: BlogData[];
  offset = 0;
  subscriptions!: Subscription;
  constructor(private dataStoreService: DataStroreService) {}

  ngOnInit() {
    this.subscriptions = this.dataStoreService.blogsChanges.subscribe(
      (data) => {
        this.blogs = data;
      }
    );
    this.blogs = this.dataStoreService.getBlogs();
  }
  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (this.blogs.length !== 100 && !this.isLoading && this.hasMore) {
            this.isLoading = true;
            this.dataStoreService.fetchBlog().subscribe((data) => {
              this.hasMore = this.blogs.length + 1 !== data.total_blogs;
              this.dataStoreService.setBlogs(data.blogs);
              this.isLoading = false;
            });
          }
        }
      },
      {
        root: null,
        threshold: 0.1,
      }
    );
    observer.observe(this.lastElement.nativeElement);
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
