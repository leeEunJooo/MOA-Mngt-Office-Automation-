<template>

    <div class="moalist">
      
      <div class="list-btn-row-box">
            <v-select
                v-model="search_select"
                class="search_box1"
                :items="items"
                item-text="name"
                item-value="code"
                label="검색기준"
                solo
                return-object
            ></v-select>

            <v-text-field
                v-model="search_text"
                v-on:keyup.enter="search"
                class="search_box2"
                label="1팀"
                placeholder="1팀"
                solo
            ></v-text-field>

            <v-btn
                v-on:click="search"
                class="search_btn"
                height="32px">
                Search
            </v-btn>
            <v-btn
                v-on:click="addfile"
                class="addfile_btn"
                height="32px">
                Add Job
            </v-btn> 
      </div>
      <v-alert
          prominent
          class="exe_alert"
          type="error"
          :value="alert"
          transition="slide-y-transition"
          @click="dismissible_close"
        >
          <div id="close_btn">
            <v-btn  
            fab x-small 
            color="white"
            outlined
            @click="show_alert_and_fade">
              <v-icon
              color="white"
              >mdi-close</v-icon>
            </v-btn>
          </div>
        현재 지원되지 않는 기능입니다.
        </v-alert> 
      

      <!-- 
        v-data-table에서는 3가지 prop를 사용
        :headers = 필드명을 지정하는 prop로 text,align,sortable, value로 구분. value의 경우는 향후 data를 적용시 데이터 내 DTO와 일치시키면 된다.
        :items = API로 받아온 결과 list가 저장되는 장소
        :items-per-page = 한 page에서 보여줄 list의 개 수. -->

 <!-- alter -->

    
        

        <v-data-table
            :headers="headers"
            :items="moa_list"
            :items-per-page="15"
            class="data_table"
            @click:row="handleClick"
        >      
        
        <template v-slot:item.exe_btn="{item}">
            <div 
            class="activate_btn"
            @click="activation(item)"
            v-bind:class="{ active: alert }"
            >
              <v-img src="../../assets/img/arrow_ic.png" class="arrow_ic"></v-img>
            </div>
        </template> 
        </v-data-table>

       
  </div>
</template>

<script>
import dayjs from 'dayjs'
import EventBus from '../../EventBus';

export default {
  //스텝별, 업무별
   component: {
      dayjs
    },

    data: function(){
      return { 
        
        // FIRST_REG_DATE.getFullYear() + "-" + (FIRST_REG_DATE.getMonth() + 1) + "-" + FIRST_REG_DATE.getDate()}
        moa_list:[],
        moa_list2:[], 
        date:"",
        temp:"a",
        items: [
          // '팀', '담당자', '대상시스템', '수행시간', '사용기술', '자동화 명칭', '매뉴얼', '전체검색'],
          {name: "팀", code: "TDC"},
          {name: "담당자", code: "ETC1"},
          {name: "대상시스템", code: "SYD"},
          {name: "수행주기", code: "CDC"},
          {name: "사용기술", code: "LDC"},
          {name: "자동화 명칭", code: "ETC2"},
          {name: "전체검색", code: "ETC3"},
        ],
        headers: [
          { text: '자동화파일', value: 'NTCART_TITLE_NM' },
          { text: '작성자', value: 'TKCGR_NM' },
          { text: '업로드일', value: 'FIRST_REG_DATE'},
          { text: '최근수행시간', value: 'EXE_DATE' },
          { text: '실행', value: 'exe_btn' }
        ],
        search_select: '',
        search_text: '',
        user:JSON.parse(localStorage.getItem('token')).user.CUST_IDFY_SEQ,
        file_seq:"",
        alert: false,
        countDown: {
          timer: "3",
          show: false
        },
      };
    },

    created() {
      

      this.$http.get("/api/mlist/selectList")
      .then((response) => {
        this.moa_list = response.data;
        for(let i = 0; i < this.moa_list.length; i++) {
          this.moa_list[i].FIRST_REG_DATE = dayjs(this.moa_list[i].FIRST_REG_DATE).format('YYYY-MM-DD');
          if(this.moa_list[i].EXE_DATE != '0000-00-00 00:00:00'){
            this.moa_list[i].EXE_DATE = dayjs(this.moa_list[i].EXE_DATE).format('YYYY-MM-DD HH:mm:ss');
          }
        }
        });


        this.$http
            .post("/api/musers/userinfo", {
            user_id: JSON.parse(localStorage.getItem('token')).user.user_id
            })
            .then(
            (response) => {
            this.login_state = false;
            this.user = response.data[0];
                }
            )

          
    },
    mounted(){
      EventBus.$on('listadd', function(text) {
        console.log(text);
        this.temp = text;
      });
      var menu = document.querySelector('.dashboard_menu').style;
      menu.setProperty('text-decoration','none');
      menu = document.querySelector('.moalist_menu').style;
      menu.setProperty('text-decoration','underline');
    },

    methods: {
      handleClick: function(items) {
        console.log(items);
        
        let routeData = this.$router.resolve({
          name: 'listdetail',
          params: {id: items.FILE_SEQ}
         });
        window.open(routeData.href+"/content", "_blank","width=680, height=850, toolbar=no, menubar=no, scrollbars=no, resizable=no");
      },
      
      search: function(){
        // if(this.search_select == "대상시스템") this.search_select = "S01";
        console.log("!!!!!!!!!!!!!!!!!!!!!", this.search_select);
        console.log("@@@@@@@@@@@@@@@@@@@@@", this.search_text);
        this.$http.post("/api/mlist/search",{
          search_select:this.search_select,
          search_text:this.search_text,
        })
        .then(
          (response)=>{
            if (Object.keys(response.data).includes('row1') && Object.keys(response.data).includes('row2')) {
              this.moa_list = [];
              this.moa_list2 = [];
              this.forCheck_list = [];

              if (response.data.row1.length == 0 && response.data.row2.length == 0) {
                alert("검색한 단어는 존재하지 않습니다.");
                this.moa_list = [];
              } else {
                console.log("처음 moa_list : ", this.moa_list);
                console.log("처음 moa_list length : ", this.moa_list.length);
                console.log("둘 다 포함");
                console.log("response.data.data1 : ", response.data.row1);
                console.log("response.data.data2 : ", response.data.row2);
                console.log("response.data.data1 길이 : ", response.data.row1.length);
                console.log("response.data.data2 길이 : ", response.data.row2.length);

                console.log("중간 moa_list : ", this.moa_list);
                console.log("중간 moa_list length : ", this.moa_list.length);

                for(let i = 0; i < response.data.row1.length; i++) {
                  // this.beforeChk_moa_list.push(response.data.row1[i]);
                  this.moa_list2.push(response.data.row1[i]);
                }

                for(let i = 0; i < response.data.row2.length; i++) {
                  this.forCheck_list.push(response.data.row2[i]);
                }

                console.log("row1만 추가된 moa_list : ", this.moa_list);
                console.log("row1 추가된 moa_list length : ", this.moa_list.length);

                console.log("forCheck_list : ", this.forCheck_list);

                // this.moa_list = this.moa_list2.filter(x => !this.forCheck_list.includes(x)).concat(this.forCheck_list.filter(x => !this.moa_list2.includes(x)));

                var merged = this.moa_list2.concat(this.forCheck_list);

                // 교집합 찾기
                var intersection = this.forCheck_list.filter(x=>{
                  return this.moa_list2.some(y=>{
                    return ((x.NTCART_TITLE_NM == y.NTCART_TITLE_NM) && (x.TKCGR_NM == y.TKCGR_NM));
                  })
                })

                // 교집합 제외하고 나머지 찾기
                var firstComplement = merged.filter(x=>{
                  return !this.moa_list2.some(y=>{
                    return ((x.NTCART_TITLE_NM == y.NTCART_TITLE_NM) && (x.TKCGR_NM == y.TKCGR_NM));
                  }) && this.forCheck_list.some(z=>{
                    return ((x.NTCART_TITLE_NM == z.NTCART_TITLE_NM) && (x.TKCGR_NM == z.TKCGR_NM));
                  })
                })
                console.log("firstComplement : ", firstComplement);

                var secondComplement = merged.filter(x=>{
                  return !this.forCheck_list.some(y=>{
                    return ((x.NTCART_TITLE_NM == y.NTCART_TITLE_NM) && (x.TKCGR_NM == y.TKCGR_NM));
                  }) && this.moa_list2.some(z=>{
                    return ((x.NTCART_TITLE_NM == z.NTCART_TITLE_NM) && (x.TKCGR_NM == z.TKCGR_NM));
                  })
                })
                console.log("secondComplement : ", secondComplement);

                for (let i = 0; i < intersection.length; i++) {
                  this.moa_list.push(intersection[i]);
                }

                for (let i = 0; i < firstComplement.length; i++) {
                  this.moa_list.push(firstComplement[i]);
                }
                
                for (let i = 0; i < secondComplement.length; i++) {
                  this.moa_list.push(secondComplement[i]);
                }
                for(let i = 0; i < this.moa_list.length; i++) {
                  this.moa_list[i].FIRST_REG_DATE = dayjs(this.moa_list[i].FIRST_REG_DATE).format('YYYY-MM-DD');
                  if(this.moa_list[i].EXE_DATE != '0000-00-00 00:00:00'){
                    this.moa_list[i].EXE_DATE = dayjs(this.moa_list[i].EXE_DATE).format('YYYY-MM-DD HH:mm:ss');
                  }
                }
              }
            } else {
              if (response.data.length == 0) {
                alert("검색한 단어는 존재하지 않습니다.");
                this.moa_list = [];
              } else {
                console.log("코드성 제외");
                console.log(response);
                console.log("response.data : ", response.data);
                console.log("response.data 길이~!~! : ", response.data.length);
                // console.log("response.data row1[0]~!~! : ", response.data.row1);
                // console.log("response.data row1[0]~!~! : ", response.data.row1[0]);
                // console.log("response.data row1[1]~!~! : ", response.data.row1[1]);
                // this.moa_list = response.data;
                // console.log("moa_list : ", this.moa_list2.length);
                this.moa_list = [];
                this.moa_list2 = [];
                this.forCheck_list = [];

                for(let i = 0; i < response.data.length; i++) {
                  // this.beforeChk_moa_list.push(response.data.row1[i]);
                  this.moa_list2.push(response.data[i]);
                }

                for(let i = 0; i < response.data.length; i++) {
                  this.forCheck_list.push(response.data[i]);
                }

                console.log("row1만 추가된 moa_list : ", this.moa_list2);
                console.log("row1 추가된 moa_list length : ", this.moa_list2.length);

                console.log("forCheck_list : ", this.forCheck_list);

                var merged2 = this.moa_list2.concat(this.forCheck_list);

                // 교집합 찾기
                var intersection2 = this.forCheck_list.filter(x=>{
                  return this.moa_list2.some(y=>{
                    return ((x.NTCART_TITLE_NM == y.NTCART_TITLE_NM) && (x.TKCGR_NM == y.TKCGR_NM));
                  })
                })

                console.log("intersection2 : ", intersection2);

                // 교집합 제외하고 나머지 찾기
                var firstComplement2 = merged2.filter(x=>{
                  return !this.moa_list2.some(y=>{
                    return ((x.NTCART_TITLE_NM == y.NTCART_TITLE_NM) && (x.TKCGR_NM == y.TKCGR_NM));
                  }) && this.forCheck_list.some(z=>{
                    return ((x.NTCART_TITLE_NM == z.NTCART_TITLE_NM) && (x.TKCGR_NM == z.TKCGR_NM));
                  })
                })
                console.log("firstComplement2 : ", firstComplement2);

                var secondComplement2 = merged2.filter(x=>{
                  return !this.forCheck_list.some(y=>{
                    return ((x.NTCART_TITLE_NM == y.NTCART_TITLE_NM) && (x.TKCGR_NM == y.TKCGR_NM));
                  }) && this.moa_list2.some(z=>{
                    return ((x.NTCART_TITLE_NM == z.NTCART_TITLE_NM) && (x.TKCGR_NM == z.TKCGR_NM));
                  })
                })
                console.log("secondComplement2 : ", secondComplement2);

                for (let i = 0; i < intersection2.length; i++) {
                  this.moa_list.push(intersection2[i]);
                }

                for (let i = 0; i < firstComplement2.length; i++) {
                  this.moa_list.push(firstComplement2[i]);
                }
                
                for (let i = 0; i < secondComplement2.length; i++) {
                  this.moa_list.push(secondComplement2[i]);
                }

                // if (response.data.length > 1) {
                //   console.log("response.data row1[0]~!~! : ", response.data[0]);
                //   console.log("response.data row1[1]~!~! : ", response.data[1]);

                //   this.moa_list = [];
                //   this.moa_list.push(response.data[0]);
                //   this.moa_list2 = response.data;

                //   // for(let i = 0; i < response.data.length; i++) {
                //   //   // this.moa_list.push(response.data.row1[i]);
                //   //   this.moa_list2.push(response.data[i]);
                //   // }

                //   console.log("moa_list21~!~! : ", this.moa_list2);

                //   // for (let i = 1; i < this.moa_list2.length; i++) {
                //   //     if ((this.moa_list2[i].NTCART_TITLE_NM == this.moa_list[i - 1].NTCART_TITLE_NM) && (this.moa_list2[i].TKCGR_NM == this.moa_list[i - 1].TKCGR_NM)) {
                //   //       continue;
                //   //     } else if ((this.moa_list2[i].NTCART_TITLE_NM != this.moa_list[i - 1].NTCART_TITLE_NM) || (this.moa_list2[i].TKCGR_NM != this.moa_list[i - 1].TKCGR_NM)) {
                //   //       this.moa_list.push(this.moa_list2[i]);
                //   //     }
                //   // }
                // }

                for(let i = 0; i < this.moa_list.length; i++) {
                this.moa_list[i].FIRST_REG_DATE = dayjs(this.moa_list[i].FIRST_REG_DATE).format('YYYY-MM-DD');
                  if(this.moa_list[i].EXE_DATE != '0000-00-00 00:00:00'){
                    this.moa_list[i].EXE_DATE = dayjs(this.moa_list[i].EXE_DATE).format('YYYY-MM-DD HH:mm:ss');
                  }
                }
              }
            }
          }
        )
      },

    addfile: function(){
      let routeData = this.$router.resolve({
                                            name: 'posting',
                                          });
      window.open(routeData.href, "_blank","width=700, height=850, toolbar=no, menubar=no, scrollbars=no, resizable=yes");
    },
    activation : function(item){
      //item.EXE_DATE update
      event.stopPropagation();
      this.show_alert_and_fade();
      console.log("file_seq", item.FILE_SEQ);

      // let curtime = new Date(); 
      // item.EXE_DATE = curtime;
      //수행시간은 sysdate로 수정
      this.$http.post('/api/mlist/update_exe_date',{
        FILE_SEQ:item.FILE_SEQ,
        USER : this.user,
        //TIME : curtime
      })
      .then(
        (res) =>{
          console.log(res);
          item.EXE_DATE =dayjs(res.data[0].EXE_DATE).format('YYYY-MM-DD HH:mm:ss');
           
        }
      )
      
    },
    dismissible_close () {
      event.stopPropagation();
      this.alert = false;
      // window.location.reload();
      
    },
    show_alert_and_fade: function(){
      this.alert = true; 
      console.log(this.alert);
    },

    } 
  }
</script>

<style>

.v-text-field.v-text-field--solo:not(.v-text-field--solo-flat) > .v-input__control > .v-input__slot{
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16) !important;
}
.moalist{
  width:100%;
  padding:10px 70px 100px 70px;
  height: fit-content;
}
.moalist .title-section{
    width:100%; 
    height:fit-content !important;
    font-family: GmarketSansBold !important;
    font-size: 27px !important;
    font-weight: bold;
    line-height: 0.14;
    letter-spacing: 0.04px;
    text-align: left;
    color: #575757;
}
.font_title{
    font-size: 26px !important;
    font-weight: bold !important;
}
.list-btn-row-box{
  margin-top:60px;
  width:100%;
}
.moalist .v-input__slot{
  min-height: 0px !important;
  height: 40px;
}
.list-btn-row-box .search_box1,
.list-btn-row-box .search_box2,
.list-btn-row-box .search_btn,
.list-btn-row-box .addfile_btn{
  display: inline-block;
  
}
.list-btn-row-box .search_box1{
  width: 160px !important;
  height: 45px !important;
}
.list-btn-row-box .search_box2{
    width: 30%;
    margin: 0px 10px;
}
.list-btn-row-box .search_btn{
    width: 94px !important;
    height: 40px !important;
    background-color: #f0217b !important;
    color : white !important;
    padding: 10px 15px !important;
    border-radius: 5px;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16);
    font-size : 18px;
    
}
.list-btn-row-box .addfile_btn{
    width: 100px !important;
    height: 40px !important;
    background-color: #5244f5 !important;
    color : white !important;
    float:right;
    padding: 5px 15px !important;
    border-radius: 5px;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16);
    font-size : 18px;
}
.v-input__slot{
  min-height: 45% !important;
}
.data_table{
  text-align: center;  
}
.data_table span{
  font-size: 21px;
  color: rgb(52, 52, 52);
  font-weight: bold;
  
}
.v-data-table-header{
  background-color: #dcddfc !important;
}
.v-data-table__wrapper .text-start{
  font-size: 19px !important;
}

/* 테이블 */
.activate_btn{
  width: 35px;
  height: 35px;
  border-radius: 30px;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
  background-color: #988df4;
  padding:5px 0px 0px 4px;
  cursor: pointer;
}
.activate_btn .arrow_ic{
  width: 90%;
  vertical-align: middle;
}
#close_btn{
  position: absolute;
  right: 6px;
  top: 12px;
}
.moalist .exe_alert{
  position:absolute !important;
  left:50%; 
  top:0;
  transform:translateX(-50%);
  z-index: 1000;
  width:500px !important;
  height: 80px;
}
</style>