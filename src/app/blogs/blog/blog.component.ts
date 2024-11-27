import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogData } from '../blogs.component';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
})
export class BlogComponent implements OnInit {
  blogId: number | null = null;
  blogContent!: BlogData;
  isLoading: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}
  ngOnInit(): void {
    this.isLoading = true;
    this.route.params.subscribe((params) => {
      this.blogId = +params['id'];
      console.log(+params['id']);
    });

    this.http
      .get<any>(
        'https://api.slingacademy.com/v1/sample-data/blog-posts/' + this.blogId
      )
      .subscribe((blogResponse) => {
        if (blogResponse && blogResponse) {
          this.blogContent = blogResponse.blog;
        }
        console.log(this.blogContent);
        this.isLoading = false;
      });
  }
  navigateToBack() {
    window.history.back();
  }
}
